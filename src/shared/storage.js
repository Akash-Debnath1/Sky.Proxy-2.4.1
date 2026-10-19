/**
 * Доступ к хранилищу браузера.
 *
 * ЕДИНСТВЕННОЕ место в проекте, где обращение к хранилищу вызывается
 * напрямую. Всё остальное — фон, попап, страница расширения — ходит сюда.
 *
 * Две области: local — всё основное, session — временное, живёт до
 * закрытия браузера: признак раздела для страницы расширения (этап 4) и
 * учёт запросов вкладок pageHosts (7Ж). У каждой области свои подписчики
 * (subscribe и sessionSubscribe ниже). Область синхронизации в проекте не
 * используется.
 */

import { KEYS, LEGACY_KEYS_LIST, SCHEMA_VERSION } from './constants.js';

const area = chrome.storage.local;
const temp = chrome.storage.session;

/** Прочитать один ключ. Нет ключа — вернётся undefined. */
export function get(key) {
  return area.get(key).then((box) => box[key]);
}

/** Записать один ключ. */
export function set(key, value) {
  return area.set({ [key]: value });
}

/**
 * Записать несколько ключей ОДНОЙ операцией.
 *
 * Этим пишет перенос данных прошлой версии (этап 8, migration.js —
 * единственный вызов в проекте): фоновый воркер может уснуть между двумя
 * отдельными записями, и данные остались бы перенесёнными наполовину.
 * Одна операция либо проходит целиком, либо не проходит.
 *
 * @param {Object} values
 */
export function setMany(values) {
  return area.set(values);
}

/**
 * Прочитать несколько ключей ОДНИМ обращением: объект «имя → значение»
 * только для ключей, которые в хранилище есть (как отдаёт браузер; нет
 * ключа — нет и имени в ответе).
 *
 * Для переноса этапа 8 (migration.js читает ключи прошлой версии и наши
 * одним чтением — снимок одного момента, не пять чтений подряд) и стенда.
 * getAll() для этого не годится: снимок всего хранилища — только диагностика.
 *
 * @param {string[]} keys
 * @returns {Promise<Object>}
 */
export function getMany(keys) {
  return area.get(keys);
}

/**
 * Снимок всего хранилища.
 *
 * ТОЛЬКО ДЛЯ ДИАГНОСТИКИ. Результат нельзя писать обратно: в нём лежат
 * и ключи прошлой версии расширения, которые трогать запрещено, и между
 * чтением и записью данные могли измениться.
 */
export function getAll() {
  return area.get(null);
}

/*
 * Временная область. Записанное здесь пропадает при закрытии браузера;
 * изменения раздаются своим подписчикам (sessionSubscribe) — один
 * слушатель onChanged ниже делит изменения по имени области: local —
 * subscribe, session — sessionSubscribe.
 * Этап 4: попап кладёт сюда признак раздела перед открытием страницы
 * расширения, страница читает его при старте и стирает (решение 08.09).
 * 7Ж: фон пишет сюда учёт запросов вкладок (pageHosts), читают его по
 * подписке попап и страница запросов.
 */

/** Прочитать один временный ключ. Нет ключа — вернётся undefined. */
export function sessionGet(key) {
  return temp.get(key).then((box) => box[key]);
}

/** Записать один временный ключ. */
export function sessionSet(key, value) {
  return temp.set({ [key]: value });
}

/** Стереть один временный ключ. */
export function sessionRemove(key) {
  return temp.remove(key);
}

/**
 * Квота временной области в байтах (7К.2, А-10): число
 * chrome.storage.session.QUOTA_BYTES либо null — области или числа нет
 * (старый браузер, стенд без квоты). Читает фон при старте воркера, чтобы
 * решить, писать ли списки запросов адресов (PAGE_REQS.MIN_QUOTA); само
 * обращение к chrome.storage — только здесь, как и всё в этом файле.
 *
 * @returns {number|null}
 */
export function sessionQuota() {
  return temp && typeof temp.QUOTA_BYTES === 'number' ? temp.QUOTA_BYTES : null;
}

/**
 * Подписаться на изменения временной области. Подписчик получает changes
 * как есть. Этап 4: уже открытая страница расширения узнаёт по этой
 * подписке, что попап оставил ей признак раздела (решение 09.09: открытая
 * вкладка страницы переиспользуется, а не открывается заново).
 *
 * @param {(changes: Object) => void} fn
 * @returns {() => void} функция отписки
 */
export function sessionSubscribe(fn) {
  sessionSubscribers.add(fn);
  return () => sessionSubscribers.delete(fn);
}

const subscribers = new Set();
/* подписчики временной области: областей друг другу не видно */
const sessionSubscribers = new Set();

/*
 * Слушатель изменений вешается на верхнем уровне модуля, синхронно.
 * Один упавший подписчик не должен ронять остальных — отсюда try внутри цикла.
 * Изменения local идут основным подписчикам, session — своим (этап 4).
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  const list = areaName === 'local' ? subscribers : areaName === 'session' ? sessionSubscribers : null;
  if (!list) return;
  for (const fn of list) {
    try {
      fn(changes);
    } catch (err) {
      console.error('[pxs] подписчик на изменения упал:', err);
    }
  }
});

/**
 * Подписаться на изменения. Возвращает функцию отписки.
 *
 * @param {(changes: Object) => void} fn
 * @returns {() => void}
 */
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Версия формы данных, записанная в хранилище. Нет — undefined. */
export function schemaVersion() {
  return get(KEYS.SCHEMA_VERSION);
}

/**
 * Лежат ли в хранилище данные прошлой версии расширения.
 *
 * Проверяется только НАЛИЧИЕ имён ключей. Значения не разбираются:
 * пустой список прошлой версии — это всё равно «человек ещё не переехал».
 *
 * @returns {Promise<boolean>}
 */
export async function hasLegacyData() {
  const found = await area.get(LEGACY_KEYS_LIST);
  return Object.keys(found).length > 0;
}

/**
 * Подготовка хранилища при старте. ТРИ исхода, а не два.
 *
 *   версия есть                            -> 'ready',  ничего не делаем
 *   версии нет и старых ключей нет         -> 'marked', размечаем
 *   версии нет, но есть старые ключи       -> 'legacy', НЕ ПИШЕМ НИЧЕГО
 *
 * ПОЧЕМУ ТРЕТИЙ ИСХОД ВАЖНЕЕ ВСЕГО В ЭТОМ ФАЙЛЕ.
 * У человека на версии 1.4.7.11 в хранилище лежат старые ключи, а версии
 * формы нет. Если по отсутствию версии просто её проставить, перенос
 * данных на этапе 8 спросит «переносили уже?», увидит единицу и ответит
 * «да». Прокси останутся лежать в старом ключе, а на экране будет пусто.
 * Молча, без единой ошибки в консоли.
 *
 * Отсюда же следствие для этапа 8: версию формы записывает сам перенос,
 * той же единственной операцией, что и данные. Старые ключи не удаляются
 * никогда, поэтому «старые ключи на месте» истинно навсегда, и вывести
 * хранилище из состояния «ещё не переехал» может только появление версии.
 *
 * @returns {Promise<{result: 'ready'|'marked'|'legacy', legacy: boolean, version: number|null}>}
 */
export async function init() {
  const version = await schemaVersion();
  if (typeof version === 'number') {
    return { result: 'ready', legacy: false, version };
  }

  if (await hasLegacyData()) {
    return { result: 'legacy', legacy: true, version: null };
  }

  await set(KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
  return { result: 'marked', legacy: false, version: SCHEMA_VERSION };
}
