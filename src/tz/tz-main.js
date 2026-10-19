/**
 * src/tz/tz-main.js — ПОДМЕНА ЧАСОВОГО ПОЯСА ДЛЯ СТРАНИЦ (2.2).
 *
 * Файл выполняется в MAIN-мире страницы на document_start, ДО её скриптов:
 * только так подмена видна всему, что страница успеет прочитать. Рядом
 * лежит файл зоны (src/tz/zones/<zone>.js), который кладёт имя пояса в
 * self.__PXS_TZ; порядок файлов задаёт registerContentScripts.
 *
 * ЧТО ПОДМЕНЯЕТСЯ. Всё, чем страница узнаёт местное время:
 *   · Intl.DateTimeFormat — без явного timeZone подставляется пояс прокси;
 *   · Date.prototype.getFullYear / getMonth / getDate / getDay / getHours /
 *     getMinutes / getSeconds / getMilliseconds / getYear /
 *     getTimezoneOffset / toString / toDateString / toTimeString /
 *     toLocaleString / toLocaleDateString / toLocaleTimeString;
 *   · сам конструктор Date — дата, собранная из местных компонентов
 *     (new Date(2026, 9, 18, 12, 0)), считается в поясе прокси, а не в
 *     системном;
 *   · Date(), вызванный без new, отдаёт строку в поясе прокси.
 *
 * ЧЕГО НЕ ДЕЛАЕТСЯ. Системные часы, UTC-методы, toISOString, Date.now и
 * разбор строк с явным смещением не трогаются: они и так не зависят от
 * пояса. Часовой пояс ОС и других приложений не меняется — расширение не
 * имеет к нему доступа, и это не «недоделка», а граница браузера.
 *
 * БЕЗ chrome.* И БЕЗ ДОКУМЕНТА: только стандартные объекты страницы.
 * Пояс можно сменить на лету — self.__PXS_TZ_SET(zone), — и снять совсем:
 * self.__PXS_TZ_SET(null). После снятия все обёртки зовут оригиналы, и
 * поведение страницы возвращается к обычному без перезагрузки.
 */
(() => {
  'use strict';

  if (self.__PXS_TZ_APPLIED__) {
    // Файл уже стоял на этой странице (повторная инъекция) — только меняем пояс.
    try { if (self.__PXS_TZ_SET) self.__PXS_TZ_SET(self.__PXS_TZ || null); } catch (err) {}
    return;
  }
  self.__PXS_TZ_APPLIED__ = true;

  const NativeDate = Date;
  const NativeDTF = Intl.DateTimeFormat;
  const dateProto = NativeDate.prototype;
  const originals = {
    getFullYear: dateProto.getFullYear,
    getMonth: dateProto.getMonth,
    getDate: dateProto.getDate,
    getDay: dateProto.getDay,
    getHours: dateProto.getHours,
    getMinutes: dateProto.getMinutes,
    getSeconds: dateProto.getSeconds,
    getMilliseconds: dateProto.getMilliseconds,
    getYear: dateProto.getYear,
    getTimezoneOffset: dateProto.getTimezoneOffset,
    toString: dateProto.toString,
    toDateString: dateProto.toDateString,
    toTimeString: dateProto.toTimeString,
    toLocaleString: dateProto.toLocaleString,
    toLocaleDateString: dateProto.toLocaleDateString,
    toLocaleTimeString: dateProto.toLocaleTimeString,
    getTime: dateProto.getTime,
  };

  let zone = null;
  let fmt = null;
  let cacheMs = NaN;
  let cacheParts = null;

  const validZone = (z) => {
    if (typeof z !== 'string' || !z) return false;
    try { new NativeDTF('en-US', { timeZone: z }); return true; } catch (err) { return false; }
  };

  function setZone(next) {
    zone = validZone(next) ? next : null;
    fmt = zone
      ? new NativeDTF('en-US', {
          timeZone: zone,
          hourCycle: 'h23',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      : null;
    cacheMs = NaN;
    cacheParts = null;
  }

  /** Местные компоненты момента ms в поясе zone. */
  function partsAt(ms) {
    if (ms === cacheMs && cacheParts) return cacheParts;
    const raw = {};
    for (const p of fmt.formatToParts(ms)) if (p.type !== 'literal') raw[p.type] = p.value;
    const whole = Math.floor(ms);
    const part = {
      year: +raw.year,
      month: +raw.month,
      day: +raw.day,
      hour: (+raw.hour) % 24,
      minute: +raw.minute,
      second: +raw.second,
      ms: ((whole % 1000) + 1000) % 1000,
      weekday: new NativeDate(Date.UTC(+raw.year, +raw.month - 1, +raw.day)).getUTCDay(),
    };
    cacheMs = ms;
    cacheParts = part;
    return part;
  }

  /** Смещение пояса в минутах в стиле getTimezoneOffset (UTC+6 → −360). */
  function offsetMinutes(ms) {
    const p = partsAt(ms);
    const asUtc = NativeDate.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, p.ms);
    return (ms - asUtc) / 60000;
  }

  /** Местное «настенное» время в поясе → метка времени (обратный пересчёт). */
  function wallToUtc(y, mo, d, h, mi, s, ms) {
    const wall = NativeDate.UTC(y, mo, d, h, mi, s, ms);
    let guess = wall;
    for (let i = 0; i < 4; i++) {
      /* offsetMinutes — в стиле getTimezoneOffset (UTC+6 → −360), поэтому
         UTC = настенное время + смещение, а не минус. */
      const off = offsetMinutes(guess) * 60000;
      const next = wall + off;
      if (next === guess) break;
      guess = next;
    }
    return guess;
  }

  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /** Строка в стиле Date.prototype.toString, но в поясе zone. */
  function zoneString(ms) {
    const p = partsAt(ms);
    const off = -offsetMinutes(ms);
    const sign = off < 0 ? '-' : '+';
    const abs = Math.abs(off);
    return `${DAYS[p.weekday]} ${MONS[p.month - 1]} ${pad(p.day)} ${p.year} `
      + `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)} `
      + `GMT${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)} (${zone})`;
  }

  /* ── Date.prototype: геттеры ─────────────────────────────────────── */
  /* Недействительная дата (NaN) обязана отвечать как native: NaN, а не
     исключением из formatToParts. Поэтому проверка до подмены. */
  const msOf = (d) => originals.getTime.call(d);
  const field = { getFullYear: 'year', getMonth: 'month', getDate: 'day', getDay: 'weekday',
    getHours: 'hour', getMinutes: 'minute', getSeconds: 'second', getMilliseconds: 'ms' };
  const getter = (name) => function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals[name].call(this);
    return partsAt(ms)[field[name]];
  };

  dateProto.getFullYear = getter('getFullYear');
  dateProto.getMonth = getter('getMonth');
  dateProto.getDate = getter('getDate');
  dateProto.getDay = getter('getDay');
  dateProto.getHours = getter('getHours');
  dateProto.getMinutes = getter('getMinutes');
  dateProto.getSeconds = getter('getSeconds');
  dateProto.getMilliseconds = getter('getMilliseconds');
  dateProto.getYear = function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals.getYear.call(this);
    return partsAt(ms).year - 1900;
  };
  dateProto.getTimezoneOffset = function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals.getTimezoneOffset.call(this);
    return offsetMinutes(ms);
  };
  dateProto.toString = function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals.toString.call(this);
    return zoneString(ms);
  };
  dateProto.toDateString = function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals.toDateString.call(this);
    const p = partsAt(ms);
    return `${DAYS[p.weekday]} ${MONS[p.month - 1]} ${pad(p.day)} ${p.year}`;
  };
  dateProto.toTimeString = function () {
    const ms = msOf(this);
    if (!zone || !Number.isFinite(ms)) return originals.toTimeString.call(this);
    const p = partsAt(ms);
    const off = -offsetMinutes(ms);
    const sign = off < 0 ? '-' : '+';
    const abs = Math.abs(off);
    return `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)} GMT${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)} (${zone})`;
  };

  dateProto.toLocaleString = function (locales, options) {
    if (!zone) return originals.toLocaleString.call(this, locales, options);
    const o = Object.assign({}, options || {});
    if (!o.timeZone) o.timeZone = zone;
    return new NativeDTF(locales, o).format(this);
  };
  dateProto.toLocaleDateString = function (locales, options) {
    if (!zone) return originals.toLocaleDateString.call(this, locales, options);
    const o = Object.assign({}, options || {});
    if (!o.timeZone) o.timeZone = zone;
    return new NativeDTF(locales, o).format(this);
  };
  dateProto.toLocaleTimeString = function (locales, options) {
    if (!zone) return originals.toLocaleTimeString.call(this, locales, options);
    const o = Object.assign({}, options || {});
    if (!o.timeZone) o.timeZone = zone;
    return new NativeDTF(locales, o).format(this);
  };

  /* ── Intl.DateTimeFormat ────────────────────────────────────────── */
  function PatchedDateTimeFormat(locales, options) {
    const o = Object.assign({}, options || {});
    if (zone && !o.timeZone) o.timeZone = zone;
    return new NativeDTF(locales, o);
  }
  PatchedDateTimeFormat.prototype = NativeDTF.prototype;
  PatchedDateTimeFormat.supportedLocalesOf = NativeDTF.supportedLocalesOf.bind(NativeDTF);
  Intl.DateTimeFormat = PatchedDateTimeFormat;

  /* ── конструктор Date ───────────────────────────────────────────── */
  /* new Date(y, m, d, ...) собирает дату из МЕСТНЫХ компонентов; при
     подмене пояса их надо пересчитать, иначе «полдень» страницы окажется
     полднем системного пояса. Один аргумент и строка идут нативным путём. */
  const DateProxy = new Proxy(NativeDate, {
    construct(target, args) {
      if (!zone || args.length < 2) return new target(...args);
      const nums = args.map((v) => Number(v));
      if (nums.some((n) => !Number.isFinite(n))) return new target(...args);
      const [y, mo = 0, d = 1, h = 0, mi = 0, s = 0, ms = 0] = nums;
      return new target(wallToUtc(y, mo, d, h, mi, s, ms));
    },
    apply() {
      if (!zone) return NativeDate();
      return zoneString(NativeDate.now());
    },
  });
  self.Date = DateProxy;

  /* ── наружу ─────────────────────────────────────────────────────── */
  self.__PXS_TZ_SET = (z) => setZone(z);
  self.__PXS_TZ_GET = () => zone;

  setZone(typeof self.__PXS_TZ === 'string' ? self.__PXS_TZ : null);
})();
