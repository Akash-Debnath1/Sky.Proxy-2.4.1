/**
 * src/shared/proxytype.js — типы прокси и их распознавание.
 *
 * ОДНО МЕСТО НА ВСЁ РАСШИРЕНИЕ: разбор вставки, схема хранилища, настройка
 * браузера, PAC-скрипт, показ в окнах. До этого файла тип был литералом
 * 'HTTP' в пяти местах, и добавить ещё один протокол можно было только
 * правкой всех пяти.
 *
 * ЧЕТЫРЕ ТИПА — ровно те, что понимает chrome.proxy:
 *   HTTP    — обычный прокси (CONNECT для https);
 *   HTTPS   — TLS-канал до самого прокси (редкая услуга, нужен сертификат);
 *   SOCKS5  — socks5 в chrome.proxy; логин и пароль Chrome не передаёт;
 *   SOCKS4  — socks4 в chrome.proxy, без логина и пароля.
 *
 * ОТКУДА БЕРЁТСЯ ТИП ПРИ ВСТАВКЕ.
 * 1. Явная схема в строке — единственный точный источник:
 *      socks5://1.2.3.4:1080   socks5h://…   socks4://…   socks4a://…
 *      http://1.2.3.4:8080     https://1.2.3.4:443
 *    Схема снимается до разбора адреса, как и раньше.
 * 2. Схемы нет — порт. Это ДОГАДКА, и она помечается typeGuess: true:
 *    окна рисуют её со звёздочкой и объясняют подсказкой. Порт 1080 —
 *    SOCKS у всех, 8080/3128 — HTTP, 443/8443 — HTTPS; всё остальное —
 *    HTTP, как было до этой правки (прежнее поведение не меняется).
 * 3. Точную проверку делает фон (typecheck.js) по кнопке «Проверить тип»:
 *    он поднимает пробный прокси и смотрит, какая схема действительно
 *    отвечает. Это единственный способ узнать правду для адреса без схемы.
 *
 * ФАЙЛ БЕЗ chrome.*, document и window: его гоняет Node на стенде и
 * импортируют оба окна, фон и PAC.
 */

/** Значения, которые лежат в поле type записи прокси и в схеме PROXY. */
export const PROXY_TYPE = Object.freeze({
  HTTP: 'HTTP',
  HTTPS: 'HTTPS',
  SOCKS5: 'SOCKS5',
  SOCKS4: 'SOCKS4',
});

/** Тот же список массивом — для oneOf в схеме и для перебора в окнах. */
export const PROXY_TYPES = Object.freeze(Object.values(PROXY_TYPE));

/** Схема в начале строки: http://, socks5h://, любой набор букв. */
const SCHEME_RE = /^([a-z][a-z0-9+.\-]*):\/\//i;

/**
 * Схема из строки прокси.
 * @param {string} raw
 * @returns {string} строчными; пустая строка — схемы нет
 */
export function schemeOf(raw) {
  const m = SCHEME_RE.exec(String(raw).trim());
  return m ? m[1].toLowerCase() : '';
}

/** Схема файла → тип. Незнакомая схема типа не даёт. */
const SCHEME_TYPE = Object.freeze({
  http: PROXY_TYPE.HTTP,
  https: PROXY_TYPE.HTTPS,
  socks: PROXY_TYPE.SOCKS5,   // голый socks:// в списках почти всегда SOCKS5
  socks5: PROXY_TYPE.SOCKS5,
  socks5h: PROXY_TYPE.SOCKS5, // h — «имена разрешает прокси», тот же протокол
  socks4: PROXY_TYPE.SOCKS4,
  socks4a: PROXY_TYPE.SOCKS4,
});

/**
 * Порт → вероятный тип. Только для строк БЕЗ схемы.
 * Таблица намеренно короткая: она не пытается угадать всё, а закрывает
 * типовые порты. Неизвестный порт — HTTP (прежнее поведение).
 * 2.3: 4145 отдан SOCKS4 — это его классический порт; SOCKS5 живёт на 1080.
 */
const PORT_TYPE = Object.freeze({
  80: PROXY_TYPE.HTTP,
  81: PROXY_TYPE.HTTP,
  443: PROXY_TYPE.HTTPS,
  1080: PROXY_TYPE.SOCKS5,
  1081: PROXY_TYPE.SOCKS5,
  1086: PROXY_TYPE.SOCKS5,
  1087: PROXY_TYPE.SOCKS5,
  1088: PROXY_TYPE.SOCKS5,
  1089: PROXY_TYPE.SOCKS5,
  3128: PROXY_TYPE.HTTP,   // Squid
  4145: PROXY_TYPE.SOCKS4,  // 2.3: классический порт SOCKS4 (SOCKS5 — 1080)
  4443: PROXY_TYPE.HTTPS,
  8000: PROXY_TYPE.HTTP,
  8008: PROXY_TYPE.HTTP,
  8080: PROXY_TYPE.HTTP,
  8081: PROXY_TYPE.HTTP,
  8118: PROXY_TYPE.HTTP,   // Privoxy
  8443: PROXY_TYPE.HTTPS,
  8888: PROXY_TYPE.HTTP,
  8899: PROXY_TYPE.HTTP,
  9000: PROXY_TYPE.HTTP,
  9050: PROXY_TYPE.SOCKS5, // Tor
  9150: PROXY_TYPE.SOCKS5, // Tor Browser
  9999: PROXY_TYPE.HTTP,
  10808: PROXY_TYPE.SOCKS5,
  10809: PROXY_TYPE.SOCKS5,
  10801: PROXY_TYPE.SOCKS5,
});

/**
 * Тип по строке и порту.
 *
 * @param {string} scheme схема из schemeOf() либо ''
 * @param {number|string} port
 * @returns {{type: string, guess: boolean}}
 *   guess: true — тип взят по порту (или по умолчанию), а не из схемы
 */
export function detectType(scheme, port) {
  const s = String(scheme || '').toLowerCase();
  if (SCHEME_TYPE[s]) return { type: SCHEME_TYPE[s], guess: false };
  const n = parseInt(port, 10);
  if (PORT_TYPE[n]) return { type: PORT_TYPE[n], guess: true };
  return { type: PROXY_TYPE.HTTP, guess: true };
}

/** Привести записанное значение к известному типу; мусор — HTTP. */
export function normType(value) {
  const t = String(value || '').toUpperCase();
  return PROXY_TYPES.includes(t) ? t : PROXY_TYPE.HTTP;
}

/**
 * Схема для chrome.proxy.settings: singleProxy.scheme.
 * Браузер ждёт строчные буквы, поле модели type сюда не подставляется.
 * @param {string} type
 * @returns {'http'|'https'|'socks5'|'socks4'}
 */
export function chromeScheme(type) {
  switch (normType(type)) {
    case PROXY_TYPE.HTTPS: return 'https';
    case PROXY_TYPE.SOCKS5: return 'socks5';
    case PROXY_TYPE.SOCKS4: return 'socks4';
    default: return 'http';
  }
}

/**
 * Директива PAC для FindProxyForURL.
 * «HTTPS host:port» в PAC означает TLS до прокси, а не «https-сайты».
 * @param {string} type
 * @returns {'PROXY'|'HTTPS'|'SOCKS5'|'SOCKS4'}
 */
export function pacDirective(type) {
  switch (normType(type)) {
    case PROXY_TYPE.HTTPS: return 'HTTPS';
    case PROXY_TYPE.SOCKS5: return 'SOCKS5';
    case PROXY_TYPE.SOCKS4: return 'SOCKS4';
    default: return 'PROXY';
  }
}

/** Обратное: директива PAC → тип (читаем маркер скрипта после браузера). */
export function typeOfPacDirective(directive) {
  switch (String(directive || '').toUpperCase()) {
    case 'HTTPS': return PROXY_TYPE.HTTPS;
    case 'SOCKS5': return PROXY_TYPE.SOCKS5;
    case 'SOCKS4': return PROXY_TYPE.SOCKS4;
    default: return PROXY_TYPE.HTTP;
  }
}

/**
 * Умеет ли браузер передавать логин и пароль такому прокси.
 * Chrome делает это только для HTTP/HTTPS; для SOCKS окно авторизации
 * не появляется, и подстановка из auth.js до прокси не доходит.
 */
export const supportsAuth = (type) =>
  normType(type) === PROXY_TYPE.HTTP || normType(type) === PROXY_TYPE.HTTPS;

/**
 * Короткая подпись для чипа: «SOCKS5», «HTTP»; догадка — со звёздочкой.
 * Имена протоколов не переводятся — как в разметке и словарях.
 */
export function typeLabel(type, guess) {
  return normType(type) + (guess ? '*' : '');
}
