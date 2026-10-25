/**
 * Состояние расширения: ЕДИНСТВЕННАЯ точка записи ключей proxies, settings,
 * state, account (с этапа 6), notifs (с 7Г) и remote (с 7И — кеш файла
 * сообщений, пишет только фон), их чтение в готовой форме и подписка на
 * изменения (единственное исключение — одна запись storage.setMany четырёх
 * ключей при переносе данных прошлой версии, migration.js, этап 8).
 *
 * Лежит в общем слое и ничего не знает ни о фоне, ни об окнах: им пользуются
 * service-worker.js, proxy.js, auth.js, popup.js, options.js и с 7Л
 * requests.js (страница запросов — тема по settings.theme). В хранилище
 * ходит только через storage.js — прямого обращения к хранилищу браузера
 * здесь нет и быть не должно.
 *
 * ЗАЧЕМ ОДНА ТОЧКА ЗАПИСИ. До этапа 4 состояние писали две функции в двух
 * файлах фона, и каждая делала «прочитать всё → поменять поле → записать
 * всё». Между чтением и записью одной вторая успевала записать своё, и её
 * правка пропадала. Здесь все записи одного контекста выстроены в очередь:
 * следующая начинает читать только после того, как предыдущая дописала.
 * Между разными контекстами (окно и фон) очереди две, но пересечься им
 * негде: окна пишут state только пока прокси выключен, фон — когда
 * включает и выключает его. account пишет только фон (этап 6); proxies с
 * этапа 6 пишет и фон — обновление добавленных по аккаунту, — поэтому оно
 * перечитывает список сразу перед записью и не пишет, если нечего менять.
 * notifs (7Г) пишут оба, но разные поля: попап — метки seen и dismissed,
 * фон — события events; setNotifs сливает по верхним полям с только что
 * прочитанным значением, так что чужое поле не затирается. Оговорка та же,
 * что у proxies на этапе 6: крестик в попапе и обрыв в фоне, совпавшие в
 * одни миллисекунды, могут потерять одну метку — принято (7Г).
 *
 * ФОРМЫ — по schema.js и таблице 3.12 мастер-промта: activeProxyId — строка,
 * пусто — '' (не null); lastError — null, 'auth' или 'dead'; listMode —
 * 'off', 'black' или 'white', listBlack и listWhite — строки (7Л);
 * notifScope — 'off' | 'added' | 'picked' | 'all', notifWatch — массив строк
 * 'ip:port' (7З).
 *
 * Функции чтения возвращают КОПИИ с подставленными умолчаниями: у
 * читающего всегда полный объект, даже если в хранилище ключа ещё нет.
 * Правки в копии до вызова функции записи никуда не попадают.
 */

import { BANNER_LIMITS, DEFAULT_THEME, KEYS, NOTIF_EVENTS_MAX, REMOTE_ERRORS, SITE_HOSTS } from './constants.js';
import * as storage from './storage.js';

/**
 * Умолчания настроек — семнадцать полей, свои (не умолчания прототипа:
 * listMode 'off', hotkeys false, notifScope 'added', …); перечень ключей
 * этого объекта — единственный перечень полей settings, по нему
 * normSettings читает запись.
 * Кто из тумблеров уже действует — сказано у схемы SETTINGS в schema.js.
 * 7Г: поля badge («Флаг страны на значке») больше нет — тумблер снят
 * решением человека 17.09 (флага на значке нет); записанное раньше
 * значение отбрасывается при чтении (normSettings) и при первой же записи
 * настроек уходит из хранилища.
 * 7Ж: siteRow (строка «Прокси для:» в окне, по умолчанию включена) и
 * siteTrack (учёт запросов страницы, по умолчанию выключен) — решение
 * человека 18.09.
 * 7Л (решение человека 19.09): списки — listMode 'off' | 'black' | 'white'
 * (по умолчанию 'off') и два независимых поля listBlack и listWhite;
 * прежние listDomains и listOn сняты — записанные раньше отбрасываются
 * при чтении (normSettings), кода перехода нет.
 * 7Д (решение человека 19.09, п. 6): hotkeys — тумблер «Горячие клавиши»
 * (по умолчанию ВЫКЛЮЧЕН — правка человека 21.09 после проверки: включает
 * сам, кто пользуется). Снять сочетания программно браузер не даёт,
 * поэтому при выключенном тумблере фон получает команду и ничего не
 * делает. Старые настройки без поля читаются как false.
 * 7З (согласие человека 15.09 и 18.09; schemaVersion остаётся 1): два поля
 * панели уведомлений — notifScope, область уведомлений о сроках ('off' |
 * 'added' | 'picked' | 'all', NOTIF_SCOPES; умолчание 'added' — как было);
 * notifWatch — адреса 'ip:port' прокси по ключу (добавленных и из аккаунта),
 * отмеченные колокольчиком при 'picked' (пишет только страница, не больше
 * NOTIF_WATCH_MAX). Третье поле, siteNotify (карточка о сбое загрузки),
 * снято решением человека 23.09 до выхода — в хранилище не бывало. Старые
 * настройки без полей читаются с умолчаниями — normSettings подставляет их
 * по ключам этого объекта.
 */
export const DEFAULT_SETTINGS = Object.freeze({
  apiKey: '',
  listMode: 'off',
  listBlack: '',
  listWhite: '',
  autoUpdate: true,
  theme: DEFAULT_THEME,
  webrtc: true,
  verify: true,
  failover: false,
  reload: false,
  restore: true,
  mask: true,
  siteRow: true,
  siteTrack: false,
  hotkeys: false,
  notifScope: 'added',
  notifWatch: Object.freeze([]),
  /* 2.2: «Часовой пояс по IP прокси» — по умолчанию выключено: это
     подмена часового пояса для страниц, и включать её без ведома
     человека нельзя. */
  tz: false,
  /* 2.4: «Страна по IP» — флаг и название у каждого адреса. Включено: это
     оформление списка, а не смена поведения браузера; выключается одной
     строкой в настройках, и тогда страну ставит только человек. */
  geoAuto: true,
});

/**
 * Умолчания состояния: прокси выключен, ничего не выбрано, ошибки нет,
 * проверка при подключении не идёт, сайт через прокси доступен (7В: поля
 * probing и probeSiteDown — состояние без них, записанное до 7В,
 * читается как false).
 */
export const DEFAULT_STATE = Object.freeze({
  enabled: false,
  activeProxyId: '',
  lastError: null,
  probing: false,
  probeSiteDown: false,
  /* 2.2: часовой пояс, который сейчас подставлен страницам, и состояние
     поиска. Пустая строка и 'idle' — подмены нет. */
  tzZone: '',
  tzStatus: 'idle',
  tzAt: 0,
  /* 2.6.1: что видят сайты — доказательство выхода ('' — ещё не мерили) */
  exitIp: '',
  exitCc: '',
  exitCity: '',
  exitAt: 0,
  exitAsk: 0,
  exitVia: '',
  directIp: '',
});

/**
 * Умолчание панели уведомлений (7Г): ничего не прочитано, не закрыто,
 * событий нет. Форма — у KEYS.NOTIFS в constants.js.
 */
export const DEFAULT_NOTIFS = Object.freeze({
  seen: Object.freeze({}),
  dismissed: Object.freeze({}),
  events: Object.freeze([]),
});

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** 2.3: то же правило наружу — фон проверяет, объект ли лежит в хранилище. */
export const isSettingsObject = isObject;

/** Список прокси: только объекты, в остальном как записано. */
function normProxies(value) {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

/**
 * Настройки: умолчания плюс записанное — только по известным полям (ключи
 * DEFAULT_SETTINGS). Лишнее в записи — badge, снятый в 7Г, listDomains и
 * listOn, снятые в 7Л, — отбрасывается: иначе оно жило бы в хранилище
 * вечно, переписываясь при каждом patchSettings.
 * 7З: notifWatch читается только массивом строк (иное — как пустой): у
 * читающего всегда массив, notifs.js и страница не проверяют форму заново.
 */
export function normSettings(value) {
  const stored = isObject(value) ? value : {};
  const out = { ...DEFAULT_SETTINGS };
  for (const k of Object.keys(DEFAULT_SETTINGS)) if (k in stored) out[k] = stored[k];
  out.notifWatch = Array.isArray(out.notifWatch) ? out.notifWatch.filter((s) => typeof s === 'string') : [];
  return out;
}

export function normState(value) {
  return { ...DEFAULT_STATE, ...(isObject(value) ? value : {}) };
}

/**
 * Кеш аккаунта (этап 6): нет ключа или он пуст — null; иначе полная форма
 * { at, items, error } с подставленными умолчаниями. items — только
 * объекты; error — только 'bad', 'expired' или 'empty' (7И, правка человека
 * 24.09: код API 1002 — заказов не найдено), остальное читается как null.
 */
const ACCOUNT_ERRORS = Object.freeze(['bad', 'expired', 'empty']);

function normAccount(value) {
  if (!isObject(value)) return null;
  return {
    at: Number.isFinite(value.at) ? value.at : 0,
    items: normProxies(value.items),
    error: ACCOUNT_ERRORS.includes(value.error) ? value.error : null,
  };
}

/**
 * Карта меток панели (7Г): «nid → мс». Остаются только строки-ключи с
 * конечным числом; всё остальное читается как отсутствие метки.
 */
function normMarks(value) {
  const out = {};
  if (!isObject(value)) return out;
  for (const nid of Object.keys(value)) {
    if (Number.isFinite(value[nid])) out[nid] = value[nid];
  }
  return out;
}

/**
 * Панель уведомлений (7Г): нет ключа — умолчание; иначе полная форма
 * { seen, dismissed, events }. События — только объекты и не больше
 * NOTIF_EVENTS_MAX последних: старые вытесняются при записи.
 */
function normNotifs(value) {
  const v = isObject(value) ? value : {};
  const events = Array.isArray(v.events) ? v.events.filter(isObject) : [];
  return {
    seen: normMarks(v.seen),
    dismissed: normMarks(v.dismissed),
    events: events.length > NOTIF_EVENTS_MAX ? events.slice(-NOTIF_EVENTS_MAX) : events,
  };
}

/**
 * Кеш файла сообщений (7И): нет ключа — null (кеша нет); иначе полная форма
 * { at, site, banners, error } с подставленными умолчаниями: site — только
 * хост из SITE_HOSTS, иначе ''; banners — только объекты, не больше
 * BANNER_LIMITS.COUNT; error — только 'net' или 'schema', остальное null.
 * Форму баннеров заново не проверяет: их оставил parseConfig (api.js),
 * читающие берут поля как есть.
 */
function normRemote(value) {
  if (!isObject(value)) return null;
  const banners = normProxies(value.banners);
  return {
    at: Number.isFinite(value.at) && value.at > 0 ? value.at : 0,
    site: typeof value.site === 'string' && SITE_HOSTS.includes(value.site) ? value.site : '',
    banners: banners.length > BANNER_LIMITS.COUNT ? banners.slice(0, BANNER_LIMITS.COUNT) : banners,
    error: REMOTE_ERRORS.includes(value.error) && value.error !== null ? value.error : null,
  };
}

/* ── чтение ── */

/** @returns {Promise<Object[]>} */
export async function getProxies() {
  return normProxies(await storage.get(KEYS.PROXIES));
}

/** @returns {Promise<Object>} */
export async function getSettings() {
  return normSettings(await storage.get(KEYS.SETTINGS));
}

/** @returns {Promise<Object>} */
export async function getState() {
  return normState(await storage.get(KEYS.STATE));
}

/**
 * Кеш списка из аккаунта (этап 6). Ключ не привязан или загрузки ещё не
 * было — null.
 * @returns {Promise<{at: number, items: Object[], error: null|'bad'|'expired'|'empty'}|null>}
 */
export async function getAccount() {
  return normAccount(await storage.get(KEYS.ACCOUNT));
}

/**
 * Панель уведомлений (7Г): метки попапа и события фона. Ключа нет — умолчание.
 * @returns {Promise<{seen: Object, dismissed: Object, events: Object[]}>}
 */
export async function getNotifs() {
  return normNotifs(await storage.get(KEYS.NOTIFS));
}

/**
 * Кеш файла сообщений (7И). Забора ещё не было — null.
 * @returns {Promise<{at: number, site: string, banners: Object[], error: null|'net'|'schema'}|null>}
 */
export async function getRemote() {
  return normRemote(await storage.get(KEYS.REMOTE));
}

/**
 * Всё сразу — окна читают этим при открытии. С этапа 6 — и кеш аккаунта,
 * с 7Г — и панель уведомлений (фон читает этим же при перерисовке значка),
 * с 7И — и кеш файла сообщений (баннеры панели, домен ссылок).
 * @returns {Promise<{proxies: Object[], settings: Object, state: Object, account: Object|null, notifs: Object, remote: Object|null}>}
 */
export async function readAll() {
  const [proxies, settings, state, account, notifs, remote] = await Promise.all([
    getProxies(), getSettings(), getState(), getAccount(), getNotifs(), getRemote(),
  ]);
  return { proxies, settings, state, account, notifs, remote };
}

/* ── запись ── */

/*
 * Очередь записей. Каждая запись — «прочитать, поменять, записать», и две
 * такие работы не должны идти внахлёст, иначе вторая перепишет результат
 * первой прочитанным до неё значением. Упавшая запись очередь не заклинивает:
 * следующая пойдёт своим чередом, а ошибка вернётся тому, кто писал.
 */
let queue = Promise.resolve();

function inTurn(work) {
  const turn = queue.then(() => work());   // 7К.2 (Б-1, узор А-5): работа без аргумента — итог предыдущей ей не передаётся
  queue = turn.catch(() => {});
  return turn;
}

/**
 * Записать список прокси целиком — так его меняют окна.
 * Одна функция на ключ: добавление, правка, удаление, «убрать дубликаты»
 * и «удалить всё» приходят сюда одним и тем же путём.
 *
 * @param {Object[]} list
 * @returns {Promise<Object[]>} записанный список
 */
export function setProxies(list) {
  if (!Array.isArray(list)) throw new Error('setProxies: нужен массив');
  return inTurn(async () => {
    const next = normProxies(list);
    await storage.set(KEYS.PROXIES, next);
    return next;
  });
}

/**
 * Дописать поля в настройки, не затирая остальные.
 *
 * @param {Object} patch
 * @returns {Promise<Object>} настройки после записи
 */
export function patchSettings(patch) {
  return inTurn(async () => {
    const current = normSettings(await storage.get(KEYS.SETTINGS));
    if (unchanged(current, patch)) return current;
    const next = { ...current, ...patch };
    await storage.set(KEYS.SETTINGS, next);
    return next;
  });
}

/**
 * Дописать поля в состояние, не затирая остальные.
 *
 * Ничего не меняется — не пишем: лишняя запись разбудила бы подписчиков
 * в окнах и в фоне на ровном месте (это правило пришло из auth.js).
 *
 * @param {Object} patch
 * @returns {Promise<Object>} состояние после записи
 */
export function patchState(patch) {
  return inTurn(async () => {
    const current = normState(await storage.get(KEYS.STATE));
    if (unchanged(current, patch)) return current;
    const next = { ...current, ...patch };
    await storage.set(KEYS.STATE, next);
    return next;
  });
}

/**
 * Записать причину последней ошибки. Имя и договор — как у прежней функции
 * в auth.js: null снимает ошибку, 'auth' и 'dead' ставят её.
 *
 * @param {null|'auth'|'dead'} value
 */
export function setLastError(value) {
  return patchState({ lastError: value });
}

/**
 * Записать кеш аккаунта целиком (этап 6) — так его пишет фон: после
 * удачной загрузки { at, items, error: null }, после отказа ключа — прежний
 * кеш с error, при отвязке ключа — null. Ключ хранилища при этом остаётся
 * со значением null: отдельной операции «стереть ключ» в storage.js нет,
 * а getAccount() читает null и объект без полей одинаково.
 *
 * @param {{at: number, items: Object[], error: null|'bad'|'expired'|'empty'}|null} value
 * @returns {Promise<Object|null>} записанное значение
 */
export function setAccount(value) {
  if (value !== null && !isObject(value)) throw new Error('setAccount: нужен объект или null');
  return inTurn(async () => {
    const next = normAccount(value);
    await storage.set(KEYS.ACCOUNT, next);
    return next;
  });
}

/**
 * Записать поля панели уведомлений (7Г): { seen?, dismissed?, events? } —
 * каждое переданное поле заменяется целиком, непереданные остаются как
 * были в хранилище на момент записи (чтение-слияние-запись в очереди).
 * Попап передаёт seen и dismissed (уже без nid, которых нет в списке
 * карточек, — иначе карты росли бы вечно), фон — events; событий
 * остаётся не больше NOTIF_EVENTS_MAX. Совпало с записанным — не пишем:
 * лишняя запись перерисовала бы попап и значок на ровном месте, а попап,
 * помечая карточки прочитанными по своему же эху, ходил бы по кругу.
 *
 * @param {{seen?: Object, dismissed?: Object, events?: Object[]}} patch
 * @returns {Promise<{seen: Object, dismissed: Object, events: Object[]}>} записанное значение
 */
export function setNotifs(patch) {
  if (!isObject(patch)) throw new Error('setNotifs: нужен объект');
  return inTurn(async () => {
    const current = normNotifs(await storage.get(KEYS.NOTIFS));
    const next = normNotifs({ ...current, ...patch });
    if (sameNotifs(current, next)) return current;
    await storage.set(KEYS.NOTIFS, next);
    return next;
  });
}

/**
 * Записать кеш файла сообщений целиком (7И) — так его пишет фон: после
 * удачного забора { at, site, banners, error: null }, после отказа — прежний
 * кеш с error ('net' / 'schema'; at, site и banners не трогаются — их
 * перечитывает и переносит фон). null — стереть (нигде не зовётся; как у
 * setAccount, ключ при этом остаётся со значением null). Второго писателя
 * нет: окна только читают.
 *
 * @param {{at: number, site: string, banners: Object[], error: null|'net'|'schema'}|null} value
 * @returns {Promise<Object|null>} записанное значение
 */
export function setRemote(value) {
  if (value !== null && !isObject(value)) throw new Error('setRemote: нужен объект или null');
  return inTurn(async () => {
    const next = normRemote(value);
    await storage.set(KEYS.REMOTE, next);
    return next;
  });
}

/**
 * Все поля правки уже стоят в текущем значении. Массивы (notifWatch —
 * единственный массив в settings) сравниваются по содержимому: та же длина
 * и каждый элемент === (7К.2, Б-4 — иначе страница, записывая тот же состав
 * новым массивом, будила подписчиков на ровном месте); остальное — ===.
 */
function unchanged(current, patch) {
  return Object.keys(patch).every((k) => sameValue(current[k], patch[k]));
}

function sameValue(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((x, i) => x === b[i]);
}

/** Одинаковы ли две карты меток — порядок ключей не в счёт. */
function sameMarks(a, b) {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every((k) => b[k] === a[k]);
}

/** Одинаковы ли две панели: карты по ключам, события по содержимому. */
function sameNotifs(a, b) {
  return sameMarks(a.seen, b.seen) && sameMarks(a.dismissed, b.dismissed)
    && JSON.stringify(a.events) === JSON.stringify(b.events);
}

/* ── подписка ── */

/**
 * Подписаться на изменения наших ключей. Подписчик получает объект, в
 * котором лежат ТОЛЬКО изменившиеся ключи, уже в готовой форме:
 * { proxies?: Object[], settings?: Object, state?: Object, account?: Object|null, notifs?: Object, remote?: Object|null }.
 * account (этап 6) может прийти как null — «кеш стёрт», поэтому его наличие
 * проверяют через 'account' in changed, а не по истинности значения; так
 * же remote (7И) — 'remote' in changed.
 * notifs (7Г) приходит и попапу (событие от фона при открытом окне), и
 * фону (метки от попапа — перерисовка значка). Возвращает функцию отписки.
 *
 * Своя запись тоже приходит сюда: хранилище рассылает изменение всем,
 * включая того, кто писал. Окна на это рассчитывают — попап и страница
 * перерисовываются одним и тем же путём, кто бы ни менял данные.
 *
 * @param {(changed: {proxies?: Object[], settings?: Object, state?: Object, account?: Object|null, notifs?: Object, remote?: Object|null}) => void} fn
 * @returns {() => void}
 */
export function subscribe(fn) {
  return storage.subscribe((changes) => {
    const changed = {};
    if (changes[KEYS.PROXIES]) changed.proxies = normProxies(changes[KEYS.PROXIES].newValue);
    if (changes[KEYS.SETTINGS]) changed.settings = normSettings(changes[KEYS.SETTINGS].newValue);
    if (changes[KEYS.STATE]) changed.state = normState(changes[KEYS.STATE].newValue);
    if (changes[KEYS.ACCOUNT]) changed.account = normAccount(changes[KEYS.ACCOUNT].newValue);
    if (changes[KEYS.NOTIFS]) changed.notifs = normNotifs(changes[KEYS.NOTIFS].newValue);
    if (changes[KEYS.REMOTE]) changed.remote = normRemote(changes[KEYS.REMOTE].newValue);
    if (Object.keys(changed).length) fn(changed);
  });
}

/* ── идентификаторы ── */

/**
 * Новый идентификатор прокси: строка из 36 знаков, схема допускает 64.
 * Счётчика нет намеренно: попап и страница добавляют прокси независимо,
 * а на этапах 6 и 8 к ним присоединятся загрузка по ключу и перенос —
 * общий счётчик пришлось бы держать в хранилище и запирать.
 */
export function newProxyId() {
  return crypto.randomUUID();
}
