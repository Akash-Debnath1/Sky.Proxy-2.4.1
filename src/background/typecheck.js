/**
 * src/background/typecheck.js — ПРОВЕРКА ПРОТОКОЛА ПРОКСИ (2.1, ускорена в 2.3).
 *
 * Зачем. Тип из строки без схемы угадан по порту (proxytype.js): 8080 — HTTP,
 * 1080 — SOCKS5, остальное — HTTP. Для нестандартного порта догадка может
 * быть неверной, и человек узнает об этом только по неработающему прокси.
 * Здесь тип проверяется по-настоящему: расширение по очереди ставит
 * пробную настройку chrome.proxy с каждой схемой и смотрит, какая из них
 * доводит запрос до gstatic.
 *
 * ЭТО НЕ ПРОВЕРКА ЖИВУЧЕСТИ (для неё probe.js). Здесь важен сам факт:
 * прокси принял рукопожатие нужного протокола и пропустил запрос.
 *
 * ПОЧЕМУ НЕЛЬЗЯ ИНАЧЕ. В браузере нет сокетов: расширение не может открыть
 * TCP-соединение и само поговорить по SOCKS. Единственный способ проверить
 * протокол — попросить браузер применить его и сделать запрос.
 *
 * ── ЧТО СДЕЛАНО ДЛЯ СКОРОСТИ (2.3) ────────────────────────────────────
 *  1. КЕШ. Подтверждённый тип живёт в chrome.storage.local (ключ typeCache,
 *     сутки). Повторная проверка того же «ip:port» — мгновенная: ни одной
 *     пробной настройки, ни одного запроса. Кеш общий для всех окон, поэтому
 *     «Проверить тип» в меню строки после проверки вставки уже не ждёт.
 *  2. ДЕШЁВЫЙ ЗАПРОС. Проба идёт на http://…/generate_204 — без TLS до
 *     сайта: у HTTP-прокси это один запрос с абсолютным URI, у SOCKS — одна
 *     TCP-труба. Прежний https:// требовал полного рукопожатия TLS на каждую
 *     из четырёх схем. Если ВСЕ схемы не ответили, верхний кандидат
 *     перепроверяется по https — так прокси, закрывающий 80-й порт, всё
 *     равно опознаётся.
 *  3. КОРОТКИЙ ТАЙМАУТ. 2 с на схему вместо 4,5 с: живой прокси отвечает
 *     за доли секунды, а «чёрная дыра» (пакет ушёл и не вернулся) — это уже
 *     не наш прокси. Худший случай 4 схем: 18 с → 8 с.
 *  4. БЕЗ ПОВТОРНЫХ ЧТЕНИЙ. Состояние и прежняя настройка читаются ОДИН раз
 *     на проверку (а не на каждую схему) и возвращаются в finally.
 *  5. В ОКНАХ. Массовая проверка вставки больше не гоняет строки, у которых
 *     тип взят из схемы: socks5://, socks4://, https:// — это точный тип,
 *     проверять нечего. Остаются только догадки по порту — их и проверяем.
 *
 * ГРАНИЦЫ.
 *  - Проверка идёт только при ВЫКЛЮЧЕННОМ прокси: иначе пришлось бы на
 *    время снимать рабочее соединение человека.
 *  - Прежняя настройка браузера сохраняется и возвращается в finally,
 *    даже если проверка упала.
 *  - Проверки идут в очереди: две одновременно переписывали бы настройку
 *    друг у друга.
 *  - Логин и пароль передаются в auth.js ТОЛЬКО на адрес проверки и только
 *    на время (setProbeAuth); в консоль не попадают.
 *
 * ФАЙЛ БЕЗ DOM. chrome.proxy и fetch есть только в фоне.
 */

import { KEYS } from '../shared/constants.js';
import { isValidAddr } from '../shared/parse.js';
import { PROXY_TYPES, chromeScheme, normType } from '../shared/proxytype.js';
import * as state from '../shared/state.js';
import { setProbeAuth } from './auth.js';

/** Куда стучимся. 204 без тела — самый дешёвый честный ответ. */
const TEST_URL = 'http://www.gstatic.com/generate_204';
/** Запасной адрес для случая «прокси закрывает 80-й порт». */
const TEST_URL_TLS = 'https://www.gstatic.com/generate_204';
/** Сколько ждём одну схему (2.3: было 4500). */
const TEST_TIMEOUT_MS = 2000;
/** Сколько ждём запасную https-перепроверку верхнего кандидата. */
const RETRY_TLS_TIMEOUT_MS = 2500;
/** Сколько живёт подтверждённый тип в кеше. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Предел размера кеша: дальше вытесняются самые старые записи. */
const CACHE_MAX = 2000;

/** Очередь: одна проверка за раз. */
let tail = Promise.resolve();

/**
 * Проверить тип прокси.
 *
 * @param {{ip: string, port: number|string, login?: string, pass?: string, type?: string, fresh?: boolean}} proxy
 * @param {{fresh?: boolean}} [opts] fresh — не брать ответ из кеша
 * @returns {Promise<{ok: true, type: string, tried: {type: string, ok: boolean, ms: number}[], cached?: boolean} | {ok: false, error: string}>}
 */
export function checkType(proxy, opts) {
  const run = () => checkOne(proxy, opts);
  const job = tail.then(run, run);
  // Хвост не должен ломаться от отказа одной проверки.
  tail = job.then(() => undefined, () => undefined);
  return job;
}

/** Порядок кандидатов: сначала заявленный тип, потом остальные. */
function candidates(type) {
  const first = normType(type);
  return [first, ...PROXY_TYPES.filter((t) => t !== first)];
}

/* ── кеш подтверждённых типов ───────────────────────────────────────── */

const cacheKey = (host, port) => host.toLowerCase() + ':' + port;

async function readCache() {
  try {
    const bag = await chrome.storage.local.get(KEYS.TYPE_CACHE);
    const c = bag && bag[KEYS.TYPE_CACHE];
    return c && typeof c === 'object' ? c : {};
  } catch (err) {
    return {};
  }
}

/** Свежий ответ из кеша или null. */
async function cacheGet(host, port) {
  const c = await readCache();
  const hit = c[cacheKey(host, port)];
  if (!hit || typeof hit.at !== 'number' || typeof hit.t !== 'string') return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) return null;
  return normType(hit.t);
}

async function cacheSet(host, port, type) {
  try {
    const c = await readCache();
    c[cacheKey(host, port)] = { t: normType(type), at: Date.now() };
    const keys = Object.keys(c);
    if (keys.length > CACHE_MAX) {
      keys
        .sort((a, b) => (c[a] && c[a].at ? c[a].at : 0) - (c[b] && c[b].at ? c[b].at : 0))
        .slice(0, keys.length - CACHE_MAX)
        .forEach((k) => delete c[k]);
    }
    await chrome.storage.local.set({ [KEYS.TYPE_CACHE]: c });
  } catch (err) {
    /* кеш — ускоритель, не обязательство: не записался — просто проверим снова */
  }
}

/* ── проба ──────────────────────────────────────────────────────────── */

/** Одна схема: поставить пробную настройку и сходить в сеть. */
async function tryScheme(proxy, type, url, timeoutMs) {
  const t0 = Date.now();
  const config = {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme: chromeScheme(type),
        host: proxy.ip,
        port: parseInt(proxy.port, 10),
      },
      // Пробная настройка без списков обхода: проверяем сам прокси.
      bypassList: [],
    },
  };
  try {
    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
  } catch (err) {
    console.warn('[pxs] проверка типа: браузер не принял пробную настройку:', err && err.message ? err.message : err);
    return { ok: false, ms: Date.now() - t0 };
  }
  const ok = await reachable(url, timeoutMs);
  return { ok, ms: Date.now() - t0 };
}

/** Дошёл ли запрос до адреса. Любой ответ — «дошёл», кроме ошибки. */
async function reachable(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'manual',
      referrerPolicy: 'no-referrer',
      signal: ctrl.signal,
    });
    return res.ok || res.status === 204 || (res.status >= 200 && res.status < 500);
  } catch (err) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Сохранить и вернуть настройку браузера как было. */
async function restore(saved) {
  try {
    if (saved && saved.level === 'controlled_by_this_extension' && saved.value) {
      await chrome.proxy.settings.set({ value: saved.value, scope: 'regular' });
    } else {
      await chrome.proxy.settings.clear({ scope: 'regular' });
    }
  } catch (err) {
    console.error('[pxs] проверка типа: прежняя настройка прокси не восстановлена:', err && err.message ? err.message : err);
  }
}

async function checkOne(input, opts) {
  const proxy = input && typeof input === 'object' ? input : {};
  const host = typeof proxy.ip === 'string' ? proxy.ip.trim() : '';
  const port = parseInt(proxy.port, 10);
  if (!isValidAddr(host) || !Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, error: 'bad' };
  }

  const st = await state.getState();
  /* 2.6: whileDead — проверка по следам обрыва. Рабочего соединения уже нет
     (фон записал 'dead'), терять нечего, и ждать, пока человек выключит
     тумблер, незачем: именно эта проверка и чинит подключение. */
  const whileDead = !!(opts && opts.whileDead);
  if (st.enabled && !whileDead) {
    // Пробная настройка сняла бы рабочее соединение — не наше право.
    return { ok: false, error: 'enabled' };
  }

  /* 2.3: подтверждённый тип — из кеша, без единого запроса. */
  const fresh = opts && opts.fresh === true;
  if (!fresh) {
    const hit = await cacheGet(host, port);
    if (hit) {
      return { ok: true, type: hit, tried: [], cached: true };
    }
  }

  let saved;
  try {
    saved = await chrome.proxy.settings.get({});
  } catch (err) {
    return { ok: false, error: 'settings' };
  }
  const level = saved && typeof saved.levelOfControl === 'string' ? saved.levelOfControl : 'not_controllable';
  if (level !== 'controllable_by_this_extension' && level !== 'controlled_by_this_extension') {
    return { ok: false, error: level };
  }

  const login = typeof proxy.login === 'string' ? proxy.login : '';
  const pass = typeof proxy.pass === 'string' ? proxy.pass : '';
  if (login) {
    setProbeAuth({ ip: host.toLowerCase(), port, login, pass, until: Date.now() + 120000 });
  }

  const list = candidates(proxy.type);
  const tried = [];
  /* 2.3: «чёрная дыра». Если запрос не вернулся НИ ОТВЕТОМ, НИ ОТКАЗОМ за
     полный таймаут — пакет ушёл в никуда: адрес не отвечает по TCP. Тогда
     остальные три схемы проверять бессмысленно, они все упрутся в тот же
     таймаут; раньше это давало 18 секунд ожидания на один мёртвый адрес.
     Отказ (RST, «прокси не отвечает») приходит за миллисекунды — его
     таймаутом не спутать. */
  let dead = false;
  try {
    /* 2.3: дешёвый http-запрос на каждую схему, по порядку, с выходом
       на первом ответе. */
    for (const type of list) {
      const r = await tryScheme({ ip: host, port }, type, TEST_URL, TEST_TIMEOUT_MS);
      tried.push({ type, ok: r.ok, ms: r.ms });
      if (r.ok) {
        console.log(`[pxs] проверка типа ${host}:${port}: ${type} за ${r.ms} мс`);
        await cacheSet(host, port, type);
        return { ok: true, type, tried };
      }
      if (r.ms >= TEST_TIMEOUT_MS - 120) { dead = true; break; }
    }
    /* 2.3: ни одна схема не ответила по http (или адрес молчит целиком).
       Один шанс по https — для прокси, который закрывает 80-й порт, и для
       медленного канала, где http-проба не успела. Верхний кандидат. */
    const first = list[0];
    const r = await tryScheme({ ip: host, port }, first, TEST_URL_TLS, RETRY_TLS_TIMEOUT_MS);
    tried.push({ type: first, ok: r.ok, ms: r.ms, tls: true });
    if (r.ok) {
      console.log(`[pxs] проверка типа ${host}:${port}: ${first} по https за ${r.ms} мс`);
      await cacheSet(host, port, first);
      return { ok: true, type: first, tried };
    }
    console.log(`[pxs] проверка типа ${host}:${port}: ни одна схема не ответила${dead ? ' (адрес не отвечает)' : ''}`);
    return { ok: false, error: 'none' };
  } finally {
    setProbeAuth(null);
    await restore(saved);
  }
}
