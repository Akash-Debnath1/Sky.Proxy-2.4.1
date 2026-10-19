/**
 * Запрос к API proxys.io и разбор ответа (этап 6).
 *
 * ЕДИНСТВЕННОЕ место в проекте, где встречаются имена полей сервера
 * (мастер-промт 3.8): port_http, port_https, port_socks5, country_code,
 * expires_at, list_ip, order_id, ip_version, ip_access. Наружу уходит
 * только наша форма записи — та же, что в schema.js, без id:
 *   { ip, port, type, login, pass, cc?, exp, expUnlimited, orderId?, src }
 * Идентификатор запись получает при добавлении (newProxyId в state.js),
 * дни срока и подписи считает format.js — здесь про дни ничего нет.
 *
 * Транспорт — API v2 (решение 10.09): v3 — непубличный пилот, получит
 * свой этап, когда станет публичной, правкой этого файла. Документации
 * по v2 нет: имена и типы полей — из живого ответа (разведка/api-v2-live.json)
 * и раздела 9 мастер-промта.
 *
 * ДВА ХОСТА (6.1, факт от человека 10.09): в части регионов основной домен
 * без прокси недоступен, зеркало отдаёт тот же API отовсюду. Список — 
 * SITE_HOSTS в constants.js, основной первым. fetchV2 пробует хосты по
 * порядку: сеть, предел ожидания, не-JSON — следующий; ответ разобрался как
 * JSON, даже с success:false, — достучались, дальше не пробуем. Хост,
 * который ответил, запоминается в памяти модуля, и следующий запрос
 * начинается с него; сон воркера возвращает к основному — допустимо.
 *
 * СЕКРЕТЫ НЕ ПЕЧАТАЮТСЯ. Ключ живёт только в адресе запроса, поэтому адрес
 * не логируется нигде и ни в одно сообщение не попадает. Сообщение об
 * ошибке от сервера человеку не показывается: его язык задаёт адрес
 * запроса, а не язык человека — тексты по коду ошибки берут окна из
 * словаря (kErrBad, kErrExpired, kErrNet и с 7И kErrEmpty для кода 1002;
 * заголовок карточки «ключ» попапа при 'empty' — nKeyEmptyT). Тело не по
 * форме и незнакомый код ошибки с 7К.2 читаются как отказ сети 'net'
 * (parseV2 ниже) — окна показывают kErrNet.
 *
 * ФАЙЛ СООБЩЕНИЙ (7И; путь CONFIG_PATH /extension.json подтверждён
 * разработчиками 28.09 — корень обоих доменов, содержимое — их): fetchConfig
 * берёт его с тех же хостов тем же обходом, что fetchV2, без ключа;
 * parseConfig — чистый разбор в нашу форму (REMOTE_BANNER в schema.js) с
 * терпимостью к расширению формата: незнакомые поля молчат, незнакомые
 * level/icon — умолчания, негодные баннеры пропускаются, длины режутся,
 * старшая schemaVersion — отказ 'schema' (кеш остаётся). Хост из поля site
 * файла фон ставит первым в очередь запросов через setPreferred. Адрес
 * файла и тексты баннеров в консоль не попадают — только числа.
 *
 * На верхнем уровне нет ни chrome.*, ни document: файл гоняется в Node.
 */

import {
  BANNER_ICONS, BANNER_LANGS, BANNER_LEVELS, BANNER_LIMITS, CONFIG_PATH, CONFIG_SCHEMA,
  EXP_MIN_MS, SITE_HOSTS, SRC,
} from '../shared/constants.js';
import { isValidAddr } from '../shared/parse.js';

/** Путь запроса без хоста и без ключа. Ключ подставляется в момент запроса и больше нигде не живёт. */
const ENDPOINT_PATH = '/ru/api/v2/ip';

/**
 * Адрес на хосте — единственное место в файле, где к хосту приписывается
 * схема. Без второго аргумента — запрос к API; с 7И тем же шаблоном
 * собирается адрес файла сообщений (CONFIG_PATH).
 */
const endpoint = (host, path = ENDPOINT_PATH) => `https://${host}${path}`;

/**
 * Сколько ждём ответ ОДНОГО хоста, прежде чем идти к следующему: с двумя
 * хостами худший случай — двадцать секунд, не больше.
 */
const TIMEOUT_MS = 10000;

/*
 * Хост, который ответил в прошлый раз, — с него начинается следующий
 * запрос. Память модуля (3.2): после сна воркера снова основной, это
 * допустимо — лишний заход к недоступному хосту раз в пробуждение.
 */
let preferred = SITE_HOSTS[0];

/** Очерёдность на этот запрос: запомненный хост, затем остальные по списку. */
function hostOrder() {
  return [preferred, ...SITE_HOSTS.filter((h) => h !== preferred)];
}

/**
 * Поставить хост первым в очередь запросов (7И): домен из поля site файла
 * сообщений — фон зовёт при старте воркера из кеша remote (память модуля
 * сон стирает — выставляется заново) и после каждого удачного забора.
 * Хост не из SITE_HOSTS или пусто — как было до 7И: основной первым.
 *
 * @param {*} host
 * @returns {string} хост, который теперь первый
 */
export function setPreferred(host) {
  preferred = typeof host === 'string' && SITE_HOSTS.includes(host) ? host : SITE_HOSTS[0];
  return preferred;
}

/**
 * Строки консоли двух запросов — API и файла сообщений. Только имя ошибки
 * и код HTTP: в тексте сообщения браузера может оказаться адрес запроса
 * (у API в нём ключ).
 */
const NET_LINES = Object.freeze({
  api: Object.freeze({
    fail: (name) => `[pxs] запрос к API не удался: ${name}`,
    notJson: (status) => `[pxs] ответ API не разобрался как JSON (HTTP ${status})`,
    notObject: (status) => `[pxs] ответ API — не объект (HTTP ${status})`,
  }),
  config: Object.freeze({
    fail: (name) => `[pxs] файл сообщений: запрос не удался (${name})`,
    notJson: (status) => `[pxs] файл сообщений: ответ не разобрался как JSON (HTTP ${status})`,
    notObject: (status) => `[pxs] файл сообщений: ответ — не объект (HTTP ${status})`,
  }),
});

/**
 * «Бессрочно» — по сырым секундам, ДО умножения на 1000 (мастер-промт 10):
 * граница 32-битного счётчика 19.01.2038 (в живых данных заказ 445668:
 * 2147472847) либо дальше пяти лет от сейчас (заказ 1687669: 2136287103,
 * сентябрь 2037 — ниже границы, но ловится вторым правилом).
 */
const UNLIMITED_SEC = 2147000000;
const UNLIMITED_AHEAD_SEC = 5 * 365 * 86400;

/**
 * Один заход по одному адресу — общий для API и файла сообщений (7И).
 *
 * Ответ пришёл и разобрался как JSON — отдаём тело, каким бы оно ни было
 * (в том числе HTTP 400 с success:false: признак ошибки — поле success,
 * не код HTTP). Сеть, таймаут, не-JSON, не объект — { kind: 'net' }.
 *
 * credentials: 'omit' — без cookie сайта; cache: 'no-store' — список
 * должен быть свежим. Запрос идёт по правилам текущего режима прокси:
 * при мёртвом прокси придёт 'net' — kErrNet советует отключить прокси.
 *
 * @param {string} url полный адрес; в консоль не попадает
 * @param {{fail: Function, notJson: Function, notObject: Function}} lines строки консоли (NET_LINES)
 * @returns {Promise<{body: Object}|{kind: 'net'}>}
 */
async function fetchJson(url, lines) {
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // Только имя ошибки: в тексте сообщения браузера может оказаться адрес запроса.
    console.warn(lines.fail(err && err.name ? err.name : 'ошибка сети'));
    return { kind: 'net' };
  }

  let body;
  try {
    body = await response.json();
  } catch (err) {
    console.warn(lines.notJson(response.status));
    return { kind: 'net' };
  }
  if (body === null || typeof body !== 'object') {
    console.warn(lines.notObject(response.status));
    return { kind: 'net' };
  }
  return { body };
}

/** Один заход к одному хосту API по ключу. */
function fetchHost(host, key) {
  return fetchJson(`${endpoint(host)}?key=${encodeURIComponent(key)}`, NET_LINES.api);
}

/**
 * Запросить список по ключу — по хостам SITE_HOSTS по очереди.
 *
 * Отказ сети, предел ожидания, не-JSON — следующий хост, со строкой в
 * консоль (имена хостов, без ключа и без адреса запроса). Ответ разобрался
 * как JSON — достучались, дальше не пробуем; ответивший хост запоминается.
 * Все хосты отказали — { kind: 'net' }.
 *
 * @param {string} key
 * @returns {Promise<{body: Object}|{kind: 'net'}>}
 */
export async function fetchV2(key) {
  const order = hostOrder();

  for (let i = 0; i < order.length; i += 1) {
    const host = order[i];
    const got = await fetchHost(host, key);
    if (got.body) {
      preferred = host;
      return got;
    }
    if (i + 1 < order.length) console.warn(`[pxs] ${host} не ответил — пробуем ${order[i + 1]}`);
  }
  return { kind: 'net' };
}

/**
 * Код страны в нашу форму: 'UK' → 'GB' (такого кода в ISO 3166-1 нет,
 * Британия — GB), верхний регистр. Всё, что не из двух латинских букв, —
 * пустая строка: поле cc в запись тогда не пишется вовсе (схема: ровно два
 * знака; пусто — флага нет, это норма по 3.9).
 *
 * @param {*} code
 * @returns {string} 'GB' | две буквы | ''
 */
export function normalizeCountry(code) {
  if (typeof code !== 'string') return '';
  const upper = code.trim().toUpperCase();
  const cc = upper === 'UK' ? 'GB' : upper;
  return /^[A-Z]{2}$/.test(cc) ? cc : '';
}

/**
 * Срок в нашу форму. expires_at — секунды, ЧИСЛО; строка из одних цифр
 * тоже принимается (порты в проекте тоже «неоднородны»), всё остальное —
 * «срока не знаем»: exp: null и expUnlimited: false, интерфейс молчит.
 * Бессрочный — exp: null и expUnlimited: true ОДНОЙ ПАРОЙ: так весь код
 * интерфейса, проверяющий p.exp, замолкает сам. Иначе exp — миллисекунды.
 * Секунды до 2001 года дали бы значение ниже границы схемы (EXP_MIN_MS) —
 * до проверки схемой не доводим, это тоже «срока не знаем».
 *
 * @param {*} raw
 * @returns {{exp: number|null, expUnlimited: boolean}}
 */
function expiry(raw) {
  let sec = NaN;
  if (typeof raw === 'number') sec = raw;
  else if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) sec = Number(raw.trim());
  if (!Number.isFinite(sec)) return { exp: null, expUnlimited: false };

  const now = Math.floor(Date.now() / 1000);
  if (sec >= UNLIMITED_SEC || sec > now + UNLIMITED_AHEAD_SEC) {
    return { exp: null, expUnlimited: true };
  }
  const ms = sec * 1000;
  if (ms < EXP_MIN_MS) return { exp: null, expUnlimited: false };
  return { exp: ms, expUnlimited: false };
}

/** Порт из чего угодно: parseInt всегда (мастер-промт 10), вне 1…65535 — NaN. */
function toPort(raw) {
  const port = parseInt(raw, 10);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : NaN;
}

/** Номер заказа: число или строка из цифр, иначе — поля не будет. */
function toOrderId(raw) {
  const id = typeof raw === 'number' ? raw : parseInt(raw, 10);
  return Number.isInteger(id) && id >= 0 ? id : NaN;
}

/**
 * Срок записи для сравнения дубликатов (7К.2, В-3): бессрочный старше
 * любого срока, известный срок — чем позже, тем старше, «срока не знаем» —
 * младше всех.
 */
function termRank(item) {
  if (item.expUnlimited) return Infinity;
  return typeof item.exp === 'number' ? item.exp : -Infinity;
}

/**
 * Разобрать тело ответа v2.
 *
 * Тело не по форме API (7К.2, В-1) — не объект либо поле success не
 * булево (ошибка бэкенда в JSON, страница-заглушка, массив) — это отказ
 * СЕТИ: { ok:false, kind:'net' } с одной строкой в консоль без тела; кеш,
 * ключ и будильник при 'net' не трогаются (runRefresh), повтор — по
 * будильнику. Ошибка сервера (success === false) — вид по коду: 1000 ключ
 * неверный — 'bad'; 1001 ключ просрочен — 'expired'; 1002 «Orders not
 * found» — 'empty' (1002 — по ключу заказов нет: аккаунт пуст, заказ не
 * оплачен или ключ неверный — по слову разработчиков 28.09, тексты 7К.3;
 * до 7И читалось как 'bad'); незнакомый код или без кода — 'net' (7К.2, В-1:
 * повтор по будильнику безопаснее ложного «ключ негоден»; до 7К.2 — 'bad').
 * Дальше 'empty' идёт теми же путями, что 'bad' (ключ не пишется,
 * обновления останавливаются) — отличаются только тексты окон (kErrEmpty,
 * nKeyEmptyT). Сырой объект ошибки уходит в console.warn — ключа в нём
 * нет, он только в адресе.
 *
 * data — МАССИВ заказов при общем ключе и ОБЪЕКТ при ключе от одного
 * заказа. Логин и пароль лежат на заказе, адреса — в list_ip заказа. Поля
 * count, ip_access, ip_version, port_https, port_socks5 не переносятся:
 * count не сходится с числом адресов (заказ 1687669: count 1, адресов 3),
 * порты https и socks5 проект не поддерживает.
 *
 * Успех без единого заказа по форме (7К.2, В-2) — data не массив и не
 * объект, пустой массив, объект без единого поля — либо без единой годной
 * записи при dropped > 0 — тоже 'net' со своей строкой: пустой ответ не
 * должен опустошать кеш аккаунта и помечать все прокси по ключу «нет в
 * аккаунте» (вопрос разработчикам, бывает ли success:true с пустым data,
 * — этап 9). Заказ с пустым list_ip — заказ без адресов, не негодная
 * запись: такой ответ по-прежнему успех с пустым списком.
 *
 * Запись с адресом не по форме (isValidAddr) или портом вне границ
 * пропускается со счётом в dropped и одной строкой в консоль — загрузку
 * не ломает. Один и тот же адрес с портом в двух заказах — одна запись:
 * «уже добавлен» и дубликаты в проекте считаются по паре ip:порт; 7К.2
 * (В-3) — остаётся запись с более поздним сроком (termRank: бессрочный >
 * больший exp > «срока не знаем»), при равном сроке — первая по порядку.
 *
 * @param {*} body
 * @returns {{ok: true, items: Object[], dropped: number}|{ok: false, kind: 'bad'|'expired'|'empty'|'net'}}
 */
export function parseV2(body) {
  if (body === null || typeof body !== 'object' || typeof body.success !== 'boolean') {
    console.warn('[pxs] API: ответ не по форме — считаем отказом сети');
    return { ok: false, kind: 'net' };
  }

  if (body.success === false) {
    const error = body.error && typeof body.error === 'object' ? body.error : null;
    const code = error ? error.code : undefined;
    console.warn('[pxs] API отказал:', error ? JSON.stringify(error) : 'тело без описания ошибки');
    return { ok: false, kind: code === 1000 ? 'bad' : code === 1001 ? 'expired' : code === 1002 ? 'empty' : 'net' };
  }

  const data = body.data;
  const orders = Array.isArray(data) ? data : data && typeof data === 'object' ? [data] : [];
  if (orders.length === 0) {
    console.warn('[pxs] API: успех без единого заказа по форме — кеш и пометки не трогаем');
    return { ok: false, kind: 'net' };
  }

  const items = [];
  const seen = new Map();   // ip:порт → индекс в items (7К.2, В-3: дубликат с более поздним сроком заменяет запись на месте)
  let dropped = 0;

  for (const order of orders) {
    if (order === null || typeof order !== 'object' || Object.keys(order).length === 0) {
      dropped += 1;
      continue;
    }
    const login = typeof order.username === 'string' ? order.username : '';
    const pass = typeof order.password === 'string' ? order.password : '';
    const cc = normalizeCountry(order.country_code);
    const { exp, expUnlimited } = expiry(order.expires_at);
    const orderId = toOrderId(order.order_id);
    const list = Array.isArray(order.list_ip) ? order.list_ip : [];

    for (const entry of list) {
      const ip = entry && typeof entry.ip === 'string' ? entry.ip.trim() : '';
      const port = entry ? toPort(entry.port_http) : NaN;
      if (!isValidAddr(ip) || !Number.isInteger(port)) {
        dropped += 1;
        continue;
      }

      const item = { ip, port, type: 'HTTP', login, pass, exp, expUnlimited, src: SRC.PXS };
      if (cc) item.cc = cc;
      if (Number.isInteger(orderId)) item.orderId = orderId;

      const pair = `${ip}:${port}`;
      if (seen.has(pair)) {
        const at = seen.get(pair);
        if (termRank(item) > termRank(items[at])) items[at] = item;
        continue;
      }
      seen.set(pair, items.length);
      items.push(item);
    }
  }

  if (dropped) console.warn(`[pxs] API: пропущено записей с негодным адресом или портом: ${dropped}`);
  if (items.length === 0 && dropped > 0) {
    console.warn('[pxs] API: успех без единого заказа по форме — кеш и пометки не трогаем');
    return { ok: false, kind: 'net' };
  }
  return { ok: true, items, dropped };
}

/* ── файл сообщений (7И) ─────────────────────────────────────────────── */

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Строка без краёв; не строка — пустая. */
function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Обрезать строку до n единиц UTF-16 (.length — единица длины схемы
 * REMOTE_BANNER; 7К.2, В-5: до того резалось по code points, и 80 эмодзи
 * давали 160 единиц против max 80 в схеме). Одинокая старшая половина пары
 * суррогатов (эмодзи) в хвосте не остаётся — срез укорачивается на один.
 */
function cut(s, n) {
  if (s.length <= n) return s;
  let end = n;
  const last = s.charCodeAt(end - 1);
  if (last >= 0xD800 && last <= 0xDBFF) end -= 1;
  return s.slice(0, end);
}

/** Поле site файла: хост из SITE_HOSTS строчными, иначе пустая строка (не путать с siteOf из parse.js — там сайт по хосту). */
function fileSite(raw) {
  const host = str(raw).toLowerCase();
  return SITE_HOSTS.includes(host) ? host : '';
}

/**
 * Адрес кнопки баннера: только https и только на хосты SITE_HOSTS —
 * чужой адрес или иная схема оставляют баннер без кнопки; длиннее
 * BANNER_LIMITS.URL (предел схемы; 7К.2, В-5 + Б-6) — тоже без кнопки.
 * @returns {string} адрес как есть либо ''
 */
function buttonUrl(raw) {
  const s = str(raw);
  if (!s || s.length > BANNER_LIMITS.URL) return '';
  let u;
  try {
    u = new URL(s);
  } catch (err) {
    return '';
  }
  return u.protocol === 'https:' && SITE_HOSTS.includes(u.hostname) ? s : '';
}

/** Дата ISO → мс; негодная или до 1970 (отрицательные мс — ниже границы схемы; 7К.2, В-5) → NaN, как отсутствующая. */
function isoMs(raw) {
  const s = str(raw);
  if (!s) return NaN;
  const ms = Date.parse(s);
  return Number.isFinite(ms) && ms >= 0 ? ms : NaN;
}

/** Строка версии «2.0.5» — только цифры и точки, не длиннее предела; иначе ''. */
function versionStr(raw) {
  const s = str(raw);
  return s && s.length <= BANNER_LIMITS.VERSION && /^\d+(\.\d+)*$/.test(s) ? s : '';
}

/**
 * Один баннер файла в нашу форму (REMOTE_BANNER в schema.js) либо null —
 * баннер пропускается (нет id, lang, title или body; lang не из
 * BANNER_LANGS; id длиннее предела). Незнакомые поля не переносятся,
 * незнакомый level → 'normal', icon → 'info'; button без url и url без
 * button — без кнопки; даты ISO → мс, негодные — поля нет; версии —
 * строкой по форме; priority — только конечное число; sticky — только
 * булево true (правка человека 24.09: карточку нельзя закрыть, пока
 * сообщение в файле), иное — поля нет.
 *
 * @param {*} raw
 * @returns {Object|null}
 */
function parseBanner(raw) {
  if (!isObject(raw)) return null;
  const id = str(raw.id);
  const lang = str(raw.lang).toLowerCase();
  const title = cut(str(raw.title), BANNER_LIMITS.TITLE);
  const body = cut(str(raw.body), BANNER_LIMITS.BODY);
  if (!id || id.length > BANNER_LIMITS.ID || !BANNER_LANGS.includes(lang) || !title || !body) return null;

  const out = {
    id,
    lang,
    title,
    body,
    level: BANNER_LEVELS.includes(raw.level) ? raw.level : 'normal',
    icon: BANNER_ICONS.includes(raw.icon) ? raw.icon : 'info',
  };
  const button = cut(str(raw.button), BANNER_LIMITS.BUTTON);
  const url = buttonUrl(raw.url);
  if (button && url) {
    out.button = button;
    out.url = url;
  }
  const from = isoMs(raw.from);
  const until = isoMs(raw.until);
  if (Number.isFinite(from)) out.from = from;
  if (Number.isFinite(until)) out.until = until;
  const minVersion = versionStr(raw.minVersion);
  const maxVersion = versionStr(raw.maxVersion);
  if (minVersion) out.minVersion = minVersion;
  if (maxVersion) out.maxVersion = maxVersion;
  if (typeof raw.priority === 'number' && Number.isFinite(raw.priority)) out.priority = raw.priority;
  if (raw.sticky === true) out.sticky = true;
  return out;
}

/**
 * Разобрать файл сообщений (чистая функция, гоняется в Node).
 *
 * Формат согласован 15.09 (терпимость к расширению — 19.09, уровни и
 * значки — решение человека 23.09): { schemaVersion, generatedAt, site,
 * banners: [ … ] }. Правила:
 *  - schemaVersion старше CONFIG_SCHEMA → { ok:false, error:'schema' }: файл
 *    не читается, строка в консоль, прежний кеш остаётся; поля нет или оно
 *    не число — считаем нашей версией (терпимость);
 *  - незнакомые поля файла и баннера игнорируются молча;
 *  - site не из SITE_HOSTS → '' со строкой в консоль (ссылки — на основной
 *    хост); нет поля — '' молча;
 *  - banners не список → пустой список; баннер не по форме — пропуск
 *    (parseBanner); повтор id — остаётся первый; не больше
 *    BANNER_LIMITS.COUNT — лишние отбрасываются со строкой в консоль.
 * Сравнение версий с версией расширения (minVersion/maxVersion) — не
 * здесь: в notifs.js по data.version (окна и фон передают из манифеста).
 * Тексты баннеров в консоль не попадают — только числа.
 *
 * @param {*} body тело файла
 * @returns {{ok: true, site: string, banners: Object[], dropped: number}|{ok: false, error: 'schema'|'bad'}}
 */
export function parseConfig(body) {
  if (!isObject(body)) return { ok: false, error: 'bad' };

  const version = body.schemaVersion;
  if (typeof version === 'number' && Number.isFinite(version) && version > CONFIG_SCHEMA) {
    console.warn(`[pxs] файл сообщений: версия формата ${version} новее нашей ${CONFIG_SCHEMA} — файл не читается`);
    return { ok: false, error: 'schema' };
  }

  const site = fileSite(body.site);
  if (!site && str(body.site)) console.warn('[pxs] файл сообщений: поле site — не хост сайта, игнорируется');

  const raw = Array.isArray(body.banners) ? body.banners : [];
  const banners = [];
  const seen = new Set();
  let dropped = 0;
  for (const item of raw) {
    const banner = parseBanner(item);
    if (!banner) {
      dropped += 1;
      continue;
    }
    if (seen.has(banner.id)) {
      dropped += 1;
      continue;
    }
    seen.add(banner.id);
    banners.push(banner);
  }
  if (banners.length > BANNER_LIMITS.COUNT) {
    console.warn(`[pxs] файл сообщений: баннеров ${banners.length}, берём первые ${BANNER_LIMITS.COUNT}`);
    banners.length = BANNER_LIMITS.COUNT;
  }
  if (dropped) console.warn(`[pxs] файл сообщений: пропущено баннеров не по форме: ${dropped}`);
  return { ok: true, site, banners, dropped };
}

/**
 * Забрать файл сообщений — по хостам SITE_HOSTS по очереди, тем же
 * обходом, что fetchV2 (10 с на хост, память ответившего хоста общая),
 * без ключа: адрес — CONFIG_PATH на хосте. Отказ сети, предел ожидания,
 * не-JSON на обоих → { ok:false, error:'net' }; файл со старшей версией
 * формата → { ok:false, error:'schema' }; удача → { ok:true, site,
 * banners, at } (at — момент забора). Адрес в консоль не попадает.
 *
 * @returns {Promise<{ok: true, site: string, banners: Object[], at: number}|{ok: false, error: 'net'|'schema'}>}
 */
export async function fetchConfig() {
  let got = { kind: 'net' };
  const order = hostOrder();
  for (let i = 0; i < order.length; i += 1) {
    got = await fetchJson(endpoint(order[i], CONFIG_PATH), NET_LINES.config);
    if (got.body) {
      preferred = order[i];
      break;
    }
    if (i + 1 < order.length) console.warn(`[pxs] файл сообщений: ${order[i]} не ответил — пробуем ${order[i + 1]}`);
  }
  if (!got.body) return { ok: false, error: 'net' };

  const parsed = parseConfig(got.body);
  if (!parsed.ok) return { ok: false, error: parsed.error === 'schema' ? 'schema' : 'net' };
  return { ok: true, site: parsed.site, banners: parsed.banners, at: Date.now() };
}
