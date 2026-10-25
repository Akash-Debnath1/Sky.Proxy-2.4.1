/**
 * Схемы данных и их проверка.
 *
 * Схема — это ДАННЫЕ: обычный объект «имя поля -> правило». Проверяет их
 * одна функция check(). Готовые библиотеки проверки схем не подходят:
 * они собирают проверку из строки прямо во время работы, а политика
 * безопасности Manifest V3 это запрещает.
 *
 * ПРАВИЛА ПОЛЯ
 *   type      'string' | 'number' | 'boolean' | 'array' | 'object'
 *             (object — с 7Г: карты меток notifs; внутрь такой карты
 *             проверка не заглядывает — её ключи произвольны)
 *   required  поля нет — это проблема
 *   oneOf     значение из списка
 *   min, max  для числа  — границы значения
 *             для строки — границы длины
 *             для массива — границы количества элементов
 *   len       строка ровно такой длины
 *   of        правило для КАЖДОГО элемента массива. Без него список меток
 *             прошёл бы проверку с числами внутри
 *   nullable  значение null допустимо
 *
 * ГЛАВНОЕ ПРАВИЛО: схема описывает то, что нужно НАМ. Незнакомые поля
 * проверка пропускает молча и не упоминает в ответе — иначе новое поле
 * в ответе сервера сломало бы расширение сразу у всех.
 *
 * СЕКРЕТЫ НЕ ПЕЧАТАЮТСЯ. В тексте проблемы сырое значение строки не
 * выводится никогда — только тип, длина или число. Единственное исключение
 * — правило oneOf: оно печатает значение, и потому ставится ТОЛЬКО на
 * перечисления. На ключ доступа и пароль его ставить нельзя, иначе они
 * утекут в журнал ошибок и в диагностику для поддержки.
 */

import {
  BANNER_ICONS,
  BANNER_LANGS,
  BANNER_LEVELS,
  BANNER_LIMITS,
  EXP_MIN_MS,
  LAST_ERRORS,
  LEVEL_OF_CONTROL,
  LIST_MODES,
  NOTIF_EVENTS_MAX,
  NOTIF_EVENT_KINDS,
  NOTIF_SCOPES,
  NOTIF_WATCH_MAX,
  PROXY_TYPES,
  REMOTE_ERRORS,
  SCHEMA_VERSION,
  SITE_HOSTS,
  SRC_VALUES,
  THEMES,
} from './constants.js';
import { TAG_LEN, TAG_MAX } from './parse.js';   /* 7К.2 (Ж-2): предел заметок — тот же, что у окон (parse.js импортирует только constants.js, круга нет) */

/** Названия типов на человеческом языке — они попадают в текст проблемы. */
const TYPE_NAMES = Object.freeze({
  string: 'строка',
  number: 'число',
  boolean: 'да/нет',
  array: 'список',
  object: 'объект',
});

/** Что за значение пришло. Само значение не показываем. */
function typeName(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'список';
  if (typeof value === 'number' && !Number.isFinite(value)) return 'не-число';
  switch (typeof value) {
    case 'string': return 'строка';
    case 'number': return 'число';
    case 'boolean': return 'да/нет';
    case 'undefined': return 'ничего';
    default: return 'объект';
  }
}

/** Печать значения — только для перечислений, см. шапку файла. */
function printable(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return `«${value}»`;
  return String(value);
}

function matchesType(value, type) {
  switch (type) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'boolean': return typeof value === 'boolean';
    case 'array': return Array.isArray(value);
    case 'object': return typeof value === 'object' && value !== null && !Array.isArray(value);
    default: return true;
  }
}

/** Проверка одного значения по одному правилу. Проблемы дописываются в out. */
function checkValue(value, rule, where, out) {
  if (value === null) {
    const listAllowsNull = Array.isArray(rule.oneOf) && rule.oneOf.includes(null);
    if (rule.nullable === true || listAllowsNull) return;
    out.push(`${where}: null здесь не допускается`);
    return;
  }

  if (rule.type && !matchesType(value, rule.type)) {
    out.push(`${where}: нужен тип ${TYPE_NAMES[rule.type]}, пришёл тип ${typeName(value)}`);
    return; // дальше проверять нечего: границы к чужому типу неприменимы
  }

  if (Array.isArray(rule.oneOf) && !rule.oneOf.includes(value)) {
    const allowed = rule.oneOf.map(printable).join(', ');
    out.push(`${where}: значение ${printable(value)} не из списка допустимых: ${allowed}`);
  }

  if (typeof value === 'number') {
    if (typeof rule.min === 'number' && value < rule.min) {
      out.push(`${where}: ${value} меньше минимума ${rule.min}`);
    }
    if (typeof rule.max === 'number' && value > rule.max) {
      out.push(`${where}: ${value} больше максимума ${rule.max}`);
    }
  }

  if (typeof value === 'string') {
    const n = value.length;
    if (typeof rule.len === 'number' && n !== rule.len) {
      out.push(`${where}: длина ${n}, а нужно ровно ${rule.len}`);
    }
    if (typeof rule.min === 'number' && n < rule.min) {
      out.push(`${where}: длина ${n}, а нужно не меньше ${rule.min}`);
    }
    if (typeof rule.max === 'number' && n > rule.max) {
      out.push(`${where}: длина ${n}, а нужно не больше ${rule.max}`);
    }
  }

  if (Array.isArray(value)) {
    const n = value.length;
    if (typeof rule.min === 'number' && n < rule.min) {
      out.push(`${where}: элементов ${n}, а нужно не меньше ${rule.min}`);
    }
    if (typeof rule.max === 'number' && n > rule.max) {
      out.push(`${where}: элементов ${n}, а нужно не больше ${rule.max}`);
    }
    if (rule.of) {
      for (let i = 0; i < value.length; i += 1) {
        checkValue(value[i], rule.of, `${where}[${i}]`, out);
      }
    }
  }
}

/**
 * Проверить объект по схеме.
 *
 * Возвращает МАССИВ ПРОБЛЕМ на человеческом языке, а не «да/нет»:
 * «что-то не так» починить нельзя, «proxies[3].port: 70000 больше
 * максимума 65535» — можно. Пустой массив означает «всё в порядке».
 *
 * path подставляется в начало каждой строки. Для списка прокси вызывающая
 * сторона перебирает его сама: check(list[i], PROXY, `proxies[${i}]`).
 *
 * @param {*} obj
 * @param {Object} schema
 * @param {string} [path]
 * @returns {string[]}
 */
export function check(obj, schema, path = '') {
  const out = [];
  const at = path || 'объект';

  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    out.push(`${at}: нужен объект, пришёл тип ${typeName(obj)}`);
    return out;
  }

  for (const field of Object.keys(schema)) {
    const rule = schema[field];
    const where = path ? `${path}.${field}` : field;
    const value = obj[field];

    if (value === undefined) {
      if (rule.required) out.push(`${where}: поле обязательное, а его нет`);
      continue; // необязательного поля может не быть — это нормально
    }

    checkValue(value, rule, where, out);
  }

  return out;
}

/**
 * Один прокси в нашей форме.
 *
 * exp — срок в МИЛЛИСЕКУНДАХ, и он nullable. У бессрочного заказа
 * expUnlimited: true и exp: null — тогда весь код интерфейса, который
 * считает остаток по exp, замолкает сам, без правок в вёрстке. Без
 * nullable бессрочный прокси не прошёл бы собственную проверку, а такой
 * заказ в боевых данных есть. Убрать поле совсем вместо null нельзя:
 * отсутствующее значение не переживает запись в хранилище, и «бессрочно»
 * стало бы неотличимо от «срока не знаем».
 *
 * На login и pass правила oneOf нет намеренно — оно печатает значение.
 *
 * gone (этап 6, решение 10.09) — прокси пришёл по ключу, но из аккаунта
 * пропал: обновление его больше не находит. Необязательное: у ручных и у
 * тех, кто в аккаунте есть, поля нет вовсе. Ставит и снимает только
 * обновление в фоне; окна рисуют по нему метку «нет в аккаунте». Из списка
 * такой прокси не удаляется никогда (3.7). schemaVersion остаётся 1.
 */
export const PROXY = Object.freeze({
  id: { type: 'string', required: true, min: 1, max: 64 },
  ip: { type: 'string', required: true, min: 1, max: 255 },
  port: { type: 'number', required: true, min: 1, max: 65535 },
  type: { type: 'string', required: true, oneOf: PROXY_TYPES },
  /* 2.1: тип взят по порту, а не из схемы строки — окна рисуют звёздочку.
     Поле необязательное: у записей до 2.1 и у прокси из аккаунта его нет,
     и это значит «тип известен точно». */
  typeGuess: { type: 'boolean' },
  /* 2.1: тип подтверждён проверкой (typecheck.js) — у такой записи нет ни
     схемы в адресе, ни догадки по порту; подсказка чипа говорит правду. */
  typeVerified: { type: 'boolean' },
  login: { type: 'string', min: 0, max: 255 },
  pass: { type: 'string', min: 0, max: 255 },
  cc: { type: 'string', len: 2 },
  /* 2.4: страну определил фон по адресу (geo.js), а не человек и не
     аккаунт. Окна рисуют у такой страны ту же метку, но правка страны
     человеком снимает флаг — ручной выбор всегда главнее. */
  ccAuto: { type: 'boolean' },
  /* 2.4: город определённого по адресу места («Lahug»), рисуется рядом со
     страной: «Philippines, Lahug». Необязательный и только у записей,
     которым его дал geo.js, — у остальных его нет и быть не может. */
  city: { type: 'string', min: 0, max: 60 },
  exp: { type: 'number', min: EXP_MIN_MS, nullable: true },
  expUnlimited: { type: 'boolean' },
  orderId: { type: 'number', min: 0 },
  src: { type: 'string', required: true, oneOf: SRC_VALUES },
  tags: { type: 'array', min: 0, max: TAG_MAX, of: { type: 'string', min: 1, max: TAG_LEN } },   // 7К.2 (Ж-2): было 32×32 при TAG_MAX 4 / TAG_LEN 16 у окон
  gone: { type: 'boolean' },
});

/**
 * Настройки человека.
 *
 * Списки доменов (7Л, решение человека 19.09): режим — одно поле listMode
 * ('off' / 'black' / 'white', см. LIST_MODES), сами списки — два независимых
 * поля listBlack и listWhite (домен в строке, строки с ведущим «!» —
 * исключения, предел 4096 у каждого). Оба хранятся при любом режиме.
 * Прежние listOn и listDomains сняты: normSettings в state.js их при
 * чтении отбрасывает, кода перехода нет (до релиза форма закрывается
 * очисткой хранилища, schemaVersion остаётся 1).
 * Системный список обхода сюда не попадает, он в константах.
 * На apiKey правила oneOf нет намеренно — оно печатает значение.
 *
 * Булевы поля внизу — тумблеры страницы расширения из прототипа
 * (этап 4: страница хранит их здесь, а не в памяти окна). Действуют:
 * mask и verify — с этапа 4 (verify целиком — 7В), webrtc — 7А, failover,
 * reload, restore — 7Б; siteRow, siteTrack — 7Ж. Седьмого поля прототипа,
 * badge («Флаг страны на значке»), с 7Г нет: тумблер снят решением
 * человека 17.09 (флага на значке нет), записанное раньше значение
 * отбрасывается при чтении (normSettings в state.js). Хранятся, чтобы
 * выбор человека не терялся между открытиями страницы.
 * 7Ж (решение человека 18.09, ответ Т4, schemaVersion остаётся 1 —
 * необязательные поля с умолчаниями): siteRow — строка «Прокси для:» в
 * окне (по умолчанию включена); siteTrack — учёт запросов страницы для
 * счёта загрузки (по умолчанию выключен). Старые настройки без этих полей
 * читаются с умолчаниями (normSettings по ключам DEFAULT_SETTINGS).
 * 7Д (решение человека 19.09, п. 6; schemaVersion остаётся 1): hotkeys —
 * тумблер «Горячие клавиши» страницы (по умолчанию выключен — правка
 * человека 21.09): при false фон получает команду сочетания и ничего не
 * делает. Как siteTrack — необязательное с умолчанием, старые записи
 * читаются без него.
 * 7З (согласие человека 15.09 и 18.09; schemaVersion остаётся 1): два
 * поля панели уведомлений, оба необязательные с умолчаниями в state.js —
 * notifScope (область уведомлений о сроках, перечисление NOTIF_SCOPES —
 * oneOf уместно: секрета нет) и notifWatch (адреса 'ip:port' прокси по
 * ключу, отмеченные при 'picked'; не больше NOTIF_WATCH_MAX строк — адрес
 * до 255 знаков, двоеточие, порт до пяти цифр); siteNotify снято решением
 * человека 23.09 до выхода.
 */
export const SETTINGS = Object.freeze({
  apiKey: { type: 'string', min: 0, max: 128 },
  listMode: { type: 'string', oneOf: LIST_MODES },
  listBlack: { type: 'string', min: 0, max: 4096 },
  listWhite: { type: 'string', min: 0, max: 4096 },
  autoUpdate: { type: 'boolean' },
  theme: { type: 'string', oneOf: THEMES },
  webrtc: { type: 'boolean' },
  verify: { type: 'boolean' },
  failover: { type: 'boolean' },
  reload: { type: 'boolean' },
  restore: { type: 'boolean' },
  mask: { type: 'boolean' },
  siteRow: { type: 'boolean' },
  siteTrack: { type: 'boolean' },
  hotkeys: { type: 'boolean' },
  notifScope: { type: 'string', oneOf: NOTIF_SCOPES },
  notifWatch: { type: 'array', min: 0, max: NOTIF_WATCH_MAX, of: { type: 'string', min: 3, max: 261 } },
  /* 2.2: «Часовой пояс по IP прокси» — тумблер в «Основных настройках».
     Необязательное с умолчанием false: записи без поля читаются как
     выключенные. */
  tz: { type: 'boolean' },
  /* 2.4: «Страна по IP» — показывать флаг и название страны рядом с
     каждым адресом. Определяется фоновым запросом к геосервису (ipwho.is
     и запасные) и кешируется на 30 дней. По умолчанию включено: это
     оформление списка, а не смена поведения браузера. */
  geoAuto: { type: 'boolean' },
});

/**
 * Текущее состояние расширения.
 *
 * activeProxyId: нет активного — ПУСТАЯ СТРОКА, не null.
 * lastError: тип не указан намеренно, список допустимых значений включает null.
 * lastProbeMs: только для диагностики, на экран не выводится.
 * probing (7В, решение человека 11.09, schemaVersion остаётся 1): запрос
 * проверки при подключении в полёте — пишет только фон; окна при
 * enabled и probing показывают «Подключение». Необязательное: старое
 * состояние без поля читается как false (умолчание в state.js).
 * probeSiteDown (7В, пятая выдача): последняя проверка получила ответ
 * только от чужих адресов проверки связи, а хосты proxys.io через этот
 * прокси молчали или отказали — прокси жив, сайт из его страны не виден;
 * пишет фон вместе с результатом, читает диагностика страницы.
 * badgeCount (7Г): сколько непрочитанных уведомлений было при последней
 * перерисовке значка (при ошибке плашка показывает метку, а не число, но
 * число записано всё равно); пишет фон при каждой перерисовке (badge.js
 * через service-worker.js), окна не читают — только диагностика.
 * migratedAt (этап 8; schemaVersion остаётся 1): время переноса данных
 * прошлой версии 1.4.7.11 в миллисекундах — пишет только перенос
 * (migration.js) одной операцией вместе с остальным состоянием; нет поля —
 * переноса не было (чистая установка). Признаком «переносили уже» не
 * служит — признак только schemaVersion (мастер-промт 3.5); читает
 * диагностика страницы. Нижняя граница — та же, что у срока: значение
 * секундами ловится проверкой.
 */
export const STATE = Object.freeze({
  enabled: { type: 'boolean', required: true },
  activeProxyId: { type: 'string', min: 0, max: 64 },
  levelOfControl: { type: 'string', oneOf: LEVEL_OF_CONTROL },
  lastError: { oneOf: LAST_ERRORS },
  lastProbeAt: { type: 'number', min: 0 },
  lastProbeMs: { type: 'number', min: 0 },
  probing: { type: 'boolean' },
  probeSiteDown: { type: 'boolean' },
  badgeCount: { type: 'number', min: 0 },
  migratedAt: { type: 'number', min: EXP_MIN_MS },   // этап 8: время переноса; нет поля — переноса не было
  /* 2.2: что сейчас с часовым поясом — для строки настройки и диагностики.
     tzZone — IANA-имя ('' — нет), tzStatus — 'idle' | 'looking' | 'on' |
     'fail', tzAt — когда поставили. Пишет только фон (tz.js). */
  /* 2.6.1: доказательство выхода. exitIp — адрес, который видят сайты
     (спрошен у внешней службы через текущее соединение), exitCc/exitCity —
     страна и город этого адреса, exitVia — при каком состоянии мерили
     ('proxy' при включённом, 'direct' при выключенном), directIp — последний
     свой адрес, снятый при выключенном прокси. Пусто — ещё не мерили. */
  exitIp: { type: 'string', max: 45 },
  exitCc: { type: 'string', len: 2 },
  exitCity: { type: 'string', max: 40 },
  exitAt: { type: 'number', min: 0 },
  /* когда спрашивали в последний раз — успешно или нет: если попытка новее
     ответа, служба не ответила, и окно говорит об этом прямо */
  exitAsk: { type: 'number', min: 0 },
  exitVia: { type: 'string', oneOf: ['', 'proxy', 'direct'] },
  directIp: { type: 'string', max: 45 },
  tzZone: { type: 'string', max: 64 },
  tzStatus: { type: 'string', oneOf: ['idle', 'looking', 'on', 'fail'] },
  tzAt: { type: 'number', min: 0 },
});

/**
 * Панель уведомлений (7Г, ключ notifs — согласие человека в промте 7Г
 * 11.09; schemaVersion остаётся 1). Форма — у KEYS в constants.js.
 * seen и dismissed — карты «nid → мс»: ключи произвольны, поэтому правило
 * только на тип. events — список событий фона; каждое событие проверяется
 * отдельно по NOTIF_EVENT, как прокси по PROXY: check(e, NOTIF_EVENT,
 * `notifs.events[${i}]`). Умолчание — пустые карты и пустой список
 * (DEFAULT_NOTIFS в state.js).
 */
export const NOTIFS = Object.freeze({
  seen: { type: 'object' },
  dismissed: { type: 'object' },
  events: { type: 'array', min: 0, max: NOTIF_EVENTS_MAX, of: { type: 'object' } },
});

/**
 * Одно событие фона в notifs.events. nid — устойчивый идентификатор
 * карточки, у событий он по времени ('lost:<at>', 'healed:<at>'): второй
 * обрыв того же прокси через неделю — новая карточка. at — мс, та же нижняя
 * граница, что у срока: значение секундами ловится проверкой. ip и newIp —
 * адреса без порта, как в остальных карточках панели; newIp только у
 * 'lost' с найденной заменой.
 */
export const NOTIF_EVENT = Object.freeze({
  nid: { type: 'string', required: true, min: 1, max: 64 },
  kind: { type: 'string', required: true, oneOf: NOTIF_EVENT_KINDS },
  at: { type: 'number', required: true, min: EXP_MIN_MS },
  id: { type: 'string', min: 1, max: 64 },
  ip: { type: 'string', min: 1, max: 255 },
  newIp: { type: 'string', min: 1, max: 255 },
  /* 2.6: у 'healed' от лечения протокола — какая схема нашлась на самом
     деле («SOCKS5»). У лечения пароля поля нет: там протокол ни при чём,
     и карточка говорит о пароле. */
  type: { type: 'string', oneOf: PROXY_TYPES },
});

/**
 * Кеш файла сообщений proxys.io (7И, седьмой ключ remote — согласие
 * человека 23.09; schemaVersion остаётся 1). Форма — у KEYS в constants.js.
 * at — мс удачного забора (0 — ещё ни разу; нижней границы EXP_MIN_MS нет
 * ради нуля); site — хост из SITE_HOSTS либо '' (oneOf уместно — секрета
 * нет); banners — не больше BANNER_LIMITS.COUNT, каждый проверяется
 * отдельно по REMOTE_BANNER, как событие по NOTIF_EVENT: check(b,
 * REMOTE_BANNER, `remote.banners[${i}]`); error — исход последнего забора.
 * Нет ключа — null: кеша нет (getRemote в state.js).
 */
export const REMOTE = Object.freeze({
  at: { type: 'number', required: true, min: 0 },
  site: { type: 'string', required: true, oneOf: ['', ...SITE_HOSTS] },
  banners: { type: 'array', required: true, min: 0, max: BANNER_LIMITS.COUNT, of: { type: 'object' } },
  error: { oneOf: REMOTE_ERRORS },
});

/**
 * Один баннер файла сообщений в нашей форме — то, что оставил parseConfig
 * (api.js): id — постоянный идентификатор из файла (nid карточки —
 * banner:<id>, менять значит потерять метки); lang — язык сообщения;
 * level и icon — всегда записаны (умолчания 'normal' / 'info' подставляет
 * разбор); button и url — только вместе (url — https на хост SITE_HOSTS,
 * проверено разбором; oneOf на адрес не ставится); from / until — мс;
 * minVersion / maxVersion — строки версии «2.0.5», сравнивает notifs.js;
 * priority — число, больше — выше; sticky — карточку нельзя закрыть, пока
 * сообщение в файле (правка человека 24.09; только true, иначе поля нет).
 * Незнакомые поля файла сюда не попадают.
 */
export const REMOTE_BANNER = Object.freeze({
  id: { type: 'string', required: true, min: 1, max: BANNER_LIMITS.ID },
  lang: { type: 'string', required: true, oneOf: BANNER_LANGS },
  title: { type: 'string', required: true, min: 1, max: BANNER_LIMITS.TITLE },
  body: { type: 'string', required: true, min: 1, max: BANNER_LIMITS.BODY },
  level: { type: 'string', required: true, oneOf: BANNER_LEVELS },
  icon: { type: 'string', required: true, oneOf: BANNER_ICONS },
  button: { type: 'string', min: 1, max: BANNER_LIMITS.BUTTON },
  url: { type: 'string', min: 1, max: BANNER_LIMITS.URL },
  from: { type: 'number', min: 0 },
  until: { type: 'number', min: 0 },
  minVersion: { type: 'string', min: 1, max: BANNER_LIMITS.VERSION },
  maxVersion: { type: 'string', min: 1, max: BANNER_LIMITS.VERSION },
  priority: { type: 'number' },
  sticky: { type: 'boolean' },
});

/**
 * Шаги перехода между версиями НАШЕЙ формы данных.
 * Шаг с индексом N ведёт с версии N на версию N+1.
 * Сейчас шагов ноль: версия первая.
 */
const STEPS = Object.freeze([]);

/**
 * Перевести данные с версии from на текущую SCHEMA_VERSION.
 *
 * Не путать с переносом со старого расширения — тот живёт в
 * src/background/migration.js (этап 8).
 *
 * Функция НИЧЕГО не читает и не пишет сама: чтение приходит извне
 * функцией read, запись делает вызывающая сторона, одной операцией
 * вместе с новой версией.
 *
 * Шаг возвращает ТОЛЬКО те ключи, которых коснулся. Если вместо этого
 * читать снимок всего хранилища и писать его обратно, то, во-первых,
 * перепишутся ключи прошлой версии расширения, которые трогать запрещено,
 * во-вторых, затрётся всё, что успело измениться между чтением и записью.
 *
 * @param {number} from версия, найденная в хранилище
 * @param {(key: string) => Promise<*>} read чтение одного ключа
 * @returns {Promise<{version: number, changes: Object}>}
 */
export async function migrateSchema(from, read) {
  if (!Number.isInteger(from)) {
    throw new Error('migrateSchema: версия должна быть целым числом');
  }

  // Данные новее кода — не трогаем ничего и не притворяемся, что перевели.
  if (from >= SCHEMA_VERSION) return { version: from, changes: {} };

  let version = from;
  const changes = {};

  while (version < SCHEMA_VERSION) {
    const step = STEPS[version];
    if (typeof step !== 'function') {
      throw new Error(`migrateSchema: нет шага перехода с версии ${version}`);
    }
    Object.assign(changes, await step(read));
    version += 1;
  }

  return { version, changes };
}
