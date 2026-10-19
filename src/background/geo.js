/**
 * src/background/geo.js — СТРАНА И ГОРОД ПО АДРЕСУ ПРОКСИ (2.4).
 *
 * Что делает. У каждой записи списка, у которой страна не задана, узнаёт
 * страну и город по адресу и записывает их в поля cc и city (плюс метку
 * ccAuto: true). Окна рисуют по ним флаг и подпись «Philippines, Lahug» —
 * так строка списка выглядит как в таблицах чекеров: адрес, страна с
 * флагом, состояние.
 *
 * ОТКУДА. Тот же перебор сервисов, что у часового пояса
 * (ipwho.is → ipapi.co → ip-api.com). Запрос идёт от браузера, а не через
 * прокси: сервис отвечает про сам адрес, работающий прокси не нужен.
 * Город необязателен: часть адресов (и часть сервисов) отдаёт только
 * страну — тогда подпись остаётся одной страной, без запятой.
 *
 * КЕШ. KEYS.GEO_CACHE — { 'ip': { cc, city, at } }. Срок 30 дней: страна
 * адреса меняется редко, а лишний запрос на каждый старт браузера ни к
 * чему. Кеш переживает удаление записи из списка: повторно добавленный
 * адрес получает страну мгновенно.
 *
 * КОГДА РАБОТАЕТ.
 *  - при старте воркера — один проход по списку (не больше GEO_MAX за раз);
 *  - после изменения списка прокси — с задержкой, чтобы пачка добавлений
 *    не запускала проход на каждую строку;
 *  - по команде 'geoOne' из окна (меню строки — «Определить страну»).
 * Человек может выключить это в настройках (settings.geoAuto): тогда
 * новые адреса остаются без страны, а уже определённые — с ней.
 *
 * ЧЕГО НЕ ДЕЛАЕТ. Не перезаписывает страну, пришедшую из аккаунта или
 * выбранную человеком: у таких записей cc уже есть, а ccAuto отсутствует.
 *
 * ФАЙЛ БЕЗ DOM: chrome.storage и fetch есть только в фоне.
 */

import { KEYS } from '../shared/constants.js';
import { hostPort, isIPHost } from '../shared/parse.js';
import * as state from '../shared/state.js';

/** Срок жизни записи кеша: страна адреса меняется редко. */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Сколько адресов разбираем за один проход. */
const GEO_MAX = 60;
/** Сколько ждём один сервис. */
const LOOKUP_TIMEOUT_MS = 2500;
/** Пауза между соседними запросами: не долбим публичный сервис. */
const GAP_MS = 120;

/** Геосервисы по порядку: только код страны, ничего лишнего. */
const LOOKUPS = Object.freeze([
  {
    name: 'ipwho.is',
    url: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country_code,city`,
    pick: (j) => (j && j.success !== false
      ? { cc: j.country_code, city: j.city }
      : null),
  },
  {
    name: 'ipapi.co',
    url: (ip) => `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
    pick: (j) => (j && !j.error ? { cc: j.country_code || j.country, city: j.city } : null),
  },
  {
    name: 'ip-api.com',
    url: (ip) => `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode,city`,
    pick: (j) => (j && j.status === 'success' ? { cc: j.countryCode, city: j.city } : null),
  },
]);

const ccOk = (v) => typeof v === 'string' && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : '';
/* Город показываем как пришёл, но чистим: только печатные символы, без
   переводов строк (они ломали бы подпись), не длиннее 40 — в строке места
   мало, а названия вроде «Llanfairpwllgwyngyll» режем многоточием. */
const cityOk = (v) => typeof v === 'string'
  ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40)
  : '';

/**
 * Один заход в сервис. Любая ошибка — null.
 * @returns {Promise<{cc: string, city: string}|null>}
 */
async function ask(service, ip) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(service.url(ip), { cache: 'no-store', credentials: 'omit', signal: ctrl.signal });
    if (!res.ok) return null;
    const got = service.pick(await res.json());
    if (!got) return null;
    const cc = ccOk(got.cc);
    return cc ? { cc, city: cityOk(got.city) } : null;
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Страна и город по адресу — перебором сервисов.
 * @returns {Promise<{cc: string, city: string}|null>}
 */
async function lookup(ip) {
  for (const service of LOOKUPS) {
    const got = await ask(service, ip);
    if (got) {
      console.log(`[pxs] страна ${ip}: ${got.cc}${got.city ? ', ' + got.city : ''} (${service.name})`);
      return got;
    }
  }
  return null;
}

/* ── кеш ────────────────────────────────────────────────────────────── */

async function readCache() {
  try {
    const bag = await chrome.storage.local.get(KEYS.GEO_CACHE);
    const c = bag && bag[KEYS.GEO_CACHE];
    return c && typeof c === 'object' ? c : {};
  } catch (err) {
    return {};
  }
}

async function writeCache(cache) {
  try {
    await chrome.storage.local.set({ [KEYS.GEO_CACHE]: cache });
  } catch (err) {
    /* кеш — ускоритель, не обязательство */
  }
}

const fresh = (rec) => rec && typeof rec.at === 'number' && Date.now() - rec.at < CACHE_TTL_MS;

/* ── запись в список ────────────────────────────────────────────────── */

/**
 * Проставить стране в записи. Пишем через state.setProxies целиком (одна
 * операция), но список перечитываем ПЕРЕД записью: пока шли запросы, человек
 * мог удалить строку или переименовать её. Совпавшие по id записи получают
 * cc, остальные не трогаются.
 */
async function applyCountries(byId) {
  if (!Object.keys(byId).length) return 0;
  const list = await state.getProxies();
  let changed = 0;
  const next = list.map((p) => {
    const got = byId[p.id];
    if (!got || !p) return p;
    if (p.cc) {                                  // ручная или аккаунтская страна главнее
      /* страна есть, а города может не быть: дополняем только город, и
         только у записи, которую заполнили мы сами (ccAuto) */
      if (p.ccAuto === true && !p.city && got.city && got.cc === p.cc) {
        changed += 1;
        return { ...p, city: got.city };
      }
      return p;
    }
    changed += 1;
    return { ...p, cc: got.cc, ...(got.city ? { city: got.city } : {}), ccAuto: true };
  });
  if (!changed) return 0;
  try {
    await state.setProxies(next);
    console.log(`[pxs] страны дописаны в ${changed} записей`);
  } catch (err) {
    console.error('[pxs] не удалось записать страны:', err);
    return 0;
  }
  return changed;
}

let running = null;

/**
 * Один проход: определить страну для всех записей, где её нет.
 * Повторный вызов во время прохода возвращает тот же промис.
 */
export function run() {
  if (running) return running;
  running = (async () => {
    try {
      const settings = await state.getSettings();
      if (settings.geoAuto === false) return 0;
      const list = await state.getProxies();
      const need = list.filter((p) => p && !p.cc && isIPHost(p.ip)).slice(0, GEO_MAX);
      if (!need.length) return 0;

      const cache = await readCache();
      const byId = {};
      let dirty = false;
      for (const p of need) {
        const hit = cache[p.ip];
        if (fresh(hit) && hit.cc) {
          byId[p.id] = { cc: ccOk(hit.cc), city: cityOk(hit.city) };
          continue;
        }
        const got = await lookup(p.ip);
        if (got) {
          byId[p.id] = got;
          cache[p.ip] = { cc: got.cc, city: got.city, at: Date.now() };
          dirty = true;
        }
        await new Promise((r) => setTimeout(r, GAP_MS));
      }
      if (dirty) await writeCache(cache);
      return await applyCountries(byId);
    } catch (err) {
      console.error('[pxs] проход по странам не удался:', err);
      return 0;
    } finally {
      running = null;
    }
  })();
  return running;
}

/**
 * Страна для одной записи — из меню строки. Возвращает { ok, cc }.
 * @param {string} id
 */
export async function one(id) {
  const list = await state.getProxies();
  const p = list.find((x) => x && x.id === id);
  if (!p) return { ok: false, error: 'notFound' };
  if (!isIPHost(p.ip)) return { ok: false, error: 'host' };
  if (p.cc) return { ok: true, cc: p.cc, same: true };

  const cache = await readCache();
  const hit = cache[p.ip];
  let got = fresh(hit) && hit.cc ? { cc: ccOk(hit.cc), city: cityOk(hit.city) } : null;
  if (!got) {
    got = await lookup(p.ip);
    if (got) {
      cache[p.ip] = { cc: got.cc, city: got.city, at: Date.now() };
      await writeCache(cache);
    }
  }
  if (!got) return { ok: false, error: 'none' };
  await applyCountries({ [p.id]: got });
  return { ok: true, cc: got.cc, city: got.city };
}

/**
 * Запуск после изменения списка: короткая задержка, чтобы пачка вставки
 * дала один проход, а не десять.
 */
let timer = null;
export function schedule(delayMs = 1200) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    run();
  }, delayMs);
}
