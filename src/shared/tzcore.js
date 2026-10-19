/**
 * src/shared/tzcore.js — ОБЩЕЕ ДЛЯ ЧАСОВОГО ПОЯСА (2.2).
 *
 * Имя файла зоны, проверка IANA-имени, срок кеша и подпись смещения.
 * Читают фон (tz.js, регистрация скриптов) и страница расширения (строка
 * состояния в настройках). Здесь нет chrome.* — файл гоняется в Node.
 */

/** Идентификатор регистрации content scripts в chrome.scripting. */
export const TZ_SCRIPT_ID = 'pxs-tz';

/** Главный файл подмены — второй в списке после файла зоны. */
export const TZ_MAIN_FILE = 'src/tz/tz-main.js';

/** Сколько живёт найденный пояс, прежде чем спросить геосервис заново. */
export const TZ_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Имя файла зоны: «America/Argentina/Buenos_Aires» →
 * «America__Argentina__Buenos_Aires». Слэш в имени файла нельзя, двойное
 * подчёркивание в IANA-именах не встречается — обратное преобразование
 * однозначно.
 * @param {string} zone
 */
export function zoneSlug(zone) {
  return String(zone).replace(/\//g, '__');
}

/** Путь файла зоны от корня расширения. */
export function zoneFile(zone) {
  return `src/tz/zones/${zoneSlug(zone)}.js`;
}

/**
 * Настоящее ли это IANA-имя. Проверка браузером: неизвестное имя
 * Intl.DateTimeFormat отвергает.
 * @param {string} zone
 */
export function isValidZone(zone) {
  if (typeof zone !== 'string' || !zone || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Смещение пояса в минутах в стиле Date.getTimezoneOffset (UTC+6 → −360).
 * @param {string} zone
 * @param {number} [at]
 */
export function zoneOffsetMinutes(zone, at = Date.now()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = {};
  for (const part of dtf.formatToParts(at)) if (part.type !== 'literal') p[part.type] = part.value;
  const whole = Math.floor(at / 1000) * 1000;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
  return Math.round((whole - asUtc) / 60000);
}

/**
 * Подпись смещения для строки настройки: «GMT+06:00», «GMT−04:00».
 * @param {string} zone
 * @param {number} [at]
 */
export function zoneOffsetLabel(zone, at = Date.now()) {
  const off = -zoneOffsetMinutes(zone, at);
  const sign = off < 0 ? '−' : '+';
  const abs = Math.abs(off);
  return `GMT${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}
