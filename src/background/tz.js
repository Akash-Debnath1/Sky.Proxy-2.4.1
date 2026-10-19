/**
 * src/background/tz.js — ЧАСОВОЙ ПОЯС ПО IP ПРОКСИ (2.2).
 *
 * Что делает. Когда включён прокси и в настройках включён «Часовой пояс по
 * IP», расширение узнаёт, в каком поясе живёт адрес прокси, и подставляет
 * этот пояс страницам: Intl и Date у них начинают отвечать так, будто
 * браузер стоит там же. Подмена живёт в MAIN-мире (src/tz/tz-main.js),
 * сюда вынесено всё, что можно сделать только из фона: выбор пояса,
 * кеш, регистрация скриптов и инъекция в уже открытые вкладки.
 *
 * ПОЧЕМУ НЕ chrome.proxy И НЕ НАСТРОЙКА ОС. Расширение не имеет доступа к
 * часовому поясу Windows/macOS — такого API в браузере нет. Единственный
 * путь — подменить то, что читает страница. Поэтому «часовой пояс браузера»
 * здесь означает «то, что видят сайты»: системные часы и другие приложения
 * не меняются.
 *
 * ОТКУДА ПОЯС.
 *  1. Кеш по адресу прокси (KEYS.TZ_CACHE, семь дней).
 *  2. Геосервис по IP: ipwho.is → ipapi.co → ip-api.com. Запрос идёт
 *     напрямую по адресу прокси; отвечает он про сам адрес, поэтому
 *     работающий прокси для поиска не нужен.
 *  3. Страна записи (cc) → первый пояс страны (tz-country.js). Это
 *     запасной путь: у больших стран поясов несколько, и ответ геосервиса
 *     точнее.
 * Ничего не нашли — статус 'fail', страницы остаются с системным поясом.
 *
 * ГРАНИЦЫ. Подмена ставится только при включённом прокси: «выключено» —
 * это системный пояс, а не пояс последнего прокси. При выключении и при
 * снятии тумблера скрипты снимаются, а уже открытые вкладки получают
 * пояс null — их Date и Intl возвращаются к обычному поведению без
 * перезагрузки.
 */

import { KEYS } from '../shared/constants.js';
import { COUNTRY_TZ } from '../shared/tz-country.js';
import { hostPort } from '../shared/parse.js';
import { TZ_MAIN_FILE, TZ_SCRIPT_ID, TZ_TTL_MS, isValidZone, zoneFile } from '../shared/tzcore.js';
import * as state from '../shared/state.js';
import * as storage from '../shared/storage.js';

/** Предел одного запроса к геосервису: три сервиса — не дольше ~7,5 с. */
const LOOKUP_TIMEOUT_MS = 2500;
/** Сколько адресов держим в кеше. */
const CACHE_MAX = 64;

/**
 * Геосервисы по порядку. Все отдают JSON без ключа.
 * pick — как достать пояс и страну из ответа; null — сервис не ответил
 * толком, идём к следующему.
 */
const LOOKUPS = Object.freeze([
  {
    name: 'ipwho.is',
    url: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,timezone,country_code`,
    pick: (j) => (j && j.success !== false && j.timezone && isValidZone(j.timezone.id)
      ? { zone: j.timezone.id, cc: typeof j.country_code === 'string' ? j.country_code : '' }
      : null),
  },
  {
    name: 'ipapi.co',
    url: (ip) => `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
    pick: (j) => (j && isValidZone(j.timezone)
      ? { zone: j.timezone, cc: typeof j.country_code === 'string' ? j.country_code : '' }
      : null),
  },
  {
    name: 'ip-api.com',
    url: (ip) => `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,timezone,countryCode`,
    pick: (j) => (j && j.status === 'success' && isValidZone(j.timezone)
      ? { zone: j.timezone, cc: typeof j.countryCode === 'string' ? j.countryCode : '' }
      : null),
  },
]);

/**
 * Один заход в геосервис. Любая ошибка и отмена — null, без исключений.
 * @param {{name: string, url: (ip: string) => string, pick: Function}} service
 * @param {string} ip
 * @param {AbortSignal} signal
 */
async function ask(service, ip, signal) {
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => ctrl.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(service.url(ip), {
      cache: 'no-store', credentials: 'omit', signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const hit = service.pick(json);
    return hit ? { ...hit, from: service.name } : null;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

/**
 * Пояс по IP — перебором сервисов, первый удачный ответ.
 * Запрос идёт через браузер, то есть через сам прокси: если прокси мёртв,
 * ответа не будет ни от кого. Поэтому ожидание короткое, а запасной путь
 * (страна записи) работает без сети.
 *
 * @param {string} ip
 * @param {AbortSignal} signal
 */
async function lookup(ip, signal) {
  for (const service of LOOKUPS) {
    if (signal.aborted) return null;
    const hit = await ask(service, ip, signal);
    if (hit) {
      console.log(`[pxs] часовой пояс ${ip}: ${hit.zone} (${hit.from})`);
      return hit;
    }
  }
  return null;
}

/* ── кеш ─────────────────────────────────────────────────────────── */

async function readCache() {
  const value = await storage.get(KEYS.TZ_CACHE);
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function cacheGet(addr) {
  const all = await readCache();
  const rec = all[addr];
  if (!rec || typeof rec.zone !== 'string' || !isValidZone(rec.zone)) return null;
  if (!Number.isFinite(rec.at) || Date.now() - rec.at > TZ_TTL_MS) return null;
  return rec.zone;
}

async function cacheSet(addr, zone) {
  const all = await readCache();
  all[addr] = { zone, at: Date.now() };
  /* Старые записи вытесняем: кеш не должен расти вместе со списком прокси. */
  const keys = Object.keys(all);
  if (keys.length > CACHE_MAX) {
    keys.sort((a, b) => (all[a].at || 0) - (all[b].at || 0));
    for (const k of keys.slice(0, keys.length - CACHE_MAX)) delete all[k];
  }
  try {
    await storage.set(KEYS.TZ_CACHE, all);
  } catch (err) {
    console.warn('[pxs] кеш часовых поясов не записан:', err);
  }
}

/* ── регистрация скриптов ───────────────────────────────────────── */

/** Файл зоны, регистрация которого не удалась ('' — не было отказа). */
let failedFile = '';

/** Какой файл зоны зарегистрирован сейчас ('' — ничего). */
async function registeredFile() {
  try {
    const list = await chrome.scripting.getRegisteredContentScripts({ ids: [TZ_SCRIPT_ID] });
    const rec = Array.isArray(list) ? list[0] : null;
    return rec && Array.isArray(rec.js) && typeof rec.js[0] === 'string' ? rec.js[0] : '';
  } catch (err) {
    return '';
  }
}

/** Снять регистрацию. Нет регистрации — не ошибка. */
async function unregister() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [TZ_SCRIPT_ID] });
  } catch (err) {
    /* «нечего снимать» — обычный случай первого запуска */
  }
}

/**
 * Зарегистрировать файл зоны и главный файл. world MAIN — иначе подмена
 * не видна скриптам страницы; document_start — до первого их чтения.
 */
async function register(zone) {
  await chrome.scripting.registerContentScripts([{
    id: TZ_SCRIPT_ID,
    matches: ['<all_urls>'],
    js: [zoneFile(zone), TZ_MAIN_FILE],
    runAt: 'document_start',
    allFrames: true,
    world: 'MAIN',
    persistAcrossSessions: true,
  }]);
}

/**
 * Разослать пояс в уже открытые вкладки.
 *
 * Одного вызова __PXS_TZ_SET мало: во вкладке, открытой ДО включения
 * подмены, никакого скрипта ещё нет, и звать нечего. Поэтому сначала
 * пробуем сеттер — если он есть, страница уже правится и довольно
 * сменить пояс; если нет — вкладываем файлы целиком (файл зоны, затем
 * tz-main.js) в тот же MAIN-мир. Страницы, куда вкладывать нельзя
 * (chrome://, магазин), молча пропускаются.
 *
 * @param {string|null} zone
 */
async function injectAll(zone) {
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({});
  } catch (err) {
    return;
  }
  const files = zone ? [zoneFile(zone), TZ_MAIN_FILE] : null;
  await Promise.allSettled(tabs.map(async (tab) => {
    if (!Number.isInteger(tab.id)) return;
    const target = { tabId: tab.id, allFrames: true };
    let patched = false;
    try {
      const [first] = await chrome.scripting.executeScript({
        target,
        world: 'MAIN',
        func: () => typeof self.__PXS_TZ_SET === 'function',
      });
      patched = Boolean(first && first.result);
    } catch (err) {
      return;   // страница закрыта или запрещена — не наша забота
    }
    try {
      if (patched) {
        await chrome.scripting.executeScript({
          target,
          world: 'MAIN',
          func: (z) => { try { self.__PXS_TZ_SET(z); } catch (err) {} },
          args: [zone],
        });
      } else if (files) {
        await chrome.scripting.executeScript({ target, world: 'MAIN', files });
      }
    } catch (err) {
      /* кадр мог исчезнуть между запросами — пропускаем */
    }
  }));
}

/**
 * Поставить пояс страницам: при смене зоны — перерегистрировать и
 * разослать; если та же зона уже стоит — ничего не делать.
 * @param {string} zone
 * @returns {Promise<boolean>} менялась ли регистрация
 */
async function applyZone(zone) {
  const want = zoneFile(zone);
  const current = await registeredFile();
  if (current === want) return false;
  /* Та же зона уже не зарегистрировалась — второй заход подряд ничего не
     изменит, а каждая запись состояния будила бы подписку заново. Ждём
     смены зоны. */
  if (failedFile === want) return null;
  await unregister();
  try {
    await register(zone);
  } catch (err) {
    failedFile = want;
    console.error('[pxs] не удалось зарегистрировать подмену часового пояса:', err);
    return null;
  }
  failedFile = '';
  await injectAll(zone);
  return true;
}

/** Снять подмену со страниц и из регистрации. */
async function clearZone() {
  await unregister();
  await injectAll(null);
}

/* ── главный вход ───────────────────────────────────────────────── */

/*
 * ОЧЕРЕДЬ И ОТМЕНА. sync() зовётся из подписки на хранилище: включение,
 * выключение, смена прокси, правка адреса и сам тумблер приходят
 * подряд. Работа идёт по очереди — иначе регистрация скриптов и записи
 * состояния переплетутся. Но ждать чужой поиск в геосервисе новому
 * вызову незачем: если прокси мёртв, поиск занимает секунды, а
 * выключение должно сработать сразу. Поэтому новый вызов поднимает
 * номер поколения и отменяет поиск предыдущего: старый проход
 * заканчивается на ближайшей проверке и ничего не пишет.
 */
let seq = 0;
let waiting = 0;
let lookupAbort = null;
let chain = Promise.resolve();

/**
 * Привести пояс в соответствие настройке, состоянию и активному прокси.
 * Можно звать сколько угодно раз: при том же поясе работы не будет.
 * @returns {Promise<void>}
 */
export function sync() {
  seq += 1;
  const my = seq;
  /* Зовущий хочет одного: чтобы пояс совпал с настройкой. Пока в очереди
     стоял прошлый проход, его работа устарела — новый вызов её отменяет
     (поиск в сети) и встаёт на её место. Проход уже начатый дойдёт до
     ближайшей проверки поколения и молча выйдет. */
  if (lookupAbort) {
    try { lookupAbort.abort(); } catch (err) {}
    lookupAbort = null;
  }
  waiting = my;
  const job = chain.then(() => {
    /* Позвали ещё раз, пока проход ждал очереди: этот уже не нужен. */
    if (my !== waiting) return undefined;
    return runSync(my);
  });
  chain = job.catch(() => undefined);
  return job;
}

async function runSync(my) {
  const stale = () => my !== seq;

  const [settings, st] = await Promise.all([state.getSettings(), state.getState()]);
  if (stale()) return;

  /* Выключено или прокси не включён: страницы должны видеть системный
     пояс. Состояние 'idle' — «подмены нет», а не ошибка. */
  if (settings.tz !== true || st.enabled !== true) {
    /* Уже чисто — не дёргаем вкладки и хранилище. */
    if (st.tzZone !== '' || st.tzStatus !== 'idle') {
      await clearZone();
      await state.patchState({ tzZone: '', tzStatus: 'idle', tzAt: 0 }).catch(() => {});
    }
    return;
  }

  const proxies = await state.getProxies();
  const proxy = proxies.find((p) => p && p.id === st.activeProxyId);
  if (!proxy) {
    await clearZone();
    await state.patchState({ tzZone: '', tzStatus: 'fail', tzAt: 0 }).catch(() => {});
    return;
  }
  if (stale()) return;

  const addr = hostPort(proxy);
  let zone = await cacheGet(addr);
  let source = zone ? 'cache' : '';

  if (!zone) {
    /* Строка «ищем пояс» — пока идёт сеть. Если поиск уже стоял, не
       переписываем зря: подписка окна не должна дёргаться. */
    if (st.tzStatus !== 'looking') {
      await state.patchState({ tzStatus: 'looking', tzZone: '' }).catch(() => {});
    }
    const ctrl = new AbortController();
    lookupAbort = ctrl;
    let hit = null;
    try {
      hit = await lookup(proxy.ip, ctrl.signal);
    } finally {
      if (lookupAbort === ctrl) lookupAbort = null;
    }
    if (stale()) return;
    if (hit) {
      zone = hit.zone;
      source = hit.from;
      await cacheSet(addr, zone);
    } else if (typeof proxy.cc === 'string' && COUNTRY_TZ[proxy.cc]) {
      zone = COUNTRY_TZ[proxy.cc];
      source = 'country';
      await cacheSet(addr, zone);
    }
  }

  if (!zone || !isValidZone(zone)) {
    /* Один раз снимаем то, что могло остаться от прошлого пояса; дальше
       статус 'fail' уже стоит, и повторного снятия не будет. */
    if (st.tzZone !== '' || st.tzStatus === 'on' || st.tzStatus === 'looking') await clearZone();
    await state.patchState({ tzZone: '', tzStatus: 'fail', tzAt: 0 }).catch(() => {});
    return;
  }

  const changed = await applyZone(zone);
  if (stale()) return;
  if (changed === null) {
    /* Регистрация не удалась: пояс не подставлен. Пишем 'fail' один раз —
       повторная запись того же значения подписку не разбудит. */
    if (st.tzZone !== '' || st.tzStatus !== 'fail') {
      await state.patchState({ tzZone: '', tzStatus: 'fail', tzAt: 0 }).catch(() => {});
    }
    return;
  }
  /* Та же зона и та же регистрация — состояние не переписываем: лишняя
     запись разбудила бы окна и перерисовала строку настройки зря. */
  if (changed || st.tzZone !== zone || st.tzStatus !== 'on') {
    await state.patchState({ tzZone: zone, tzStatus: 'on', tzAt: Date.now() }).catch(() => {});
  }
  if (changed) console.log(`[pxs] часовой пояс страниц: ${zone} (${source || 'кеш'})`);
}
