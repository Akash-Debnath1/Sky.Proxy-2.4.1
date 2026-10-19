/**
 * PAC-скрипт для списков доменов (этап 5).
 *
 * Здесь собирается текст скрипта, который браузер выполняет сам на каждый
 * запрос и по нему решает: этот адрес — через прокси или напрямую.
 * Чёрный список — перечисленные домены напрямую, остальное через прокси;
 * белый — наоборот, через прокси только перечисленные.
 *
 * ЧИСТЫЕ ФУНКЦИИ. Ни chrome.*, ни document: файл гоняется в Node на стенде,
 * и именно так скрипт проверяется до того, как попадёт в браузер. Ошибка
 * в PAC ломает весь интернет в браузере, а увидеть её до применения нечем.
 *
 * РАЗБОР СПИСКА — В parse.js (7Ж, шаг 1: переезд, не копия). normalizeDomains,
 * listsFrom и разбор сетей системного обхода (bypassNets) читает с 7Ж не
 * только фон, но и попап, поэтому они живут в общем слое; здесь остались
 * шаблон, сборка текста и маркер. listsFrom ре-экспортируется отсюда, чтобы
 * proxy.js и service-worker.js не менять. Покрытие хоста правилом в
 * попапе (coverage в parse.js) повторяет смысл inList шаблона ниже —
 * стенд 7Ж сверяет их на одной матрице хостов.
 *
 * ШАБЛОН НЕИЗМЕННЫЙ. В него подставляются пять значений, каждое через
 * JSON.stringify: строка прокси (PROXY), режим (MODE), объект доменов
 * (LIST), флаг «хост без точки» (LOCAL) и таблица сетей системного обхода
 * (NETS). Ни одно из них не может внести в скрипт ни кавычки, ни перевода
 * строки, ни чужого кода — ломать синтаксис нечем. Проверять скрипт
 * выполнением внутри расширения нельзя (CSP Manifest V3) и не нужно.
 *
 * Шаблон — ES5 и только ASCII: скрипт уезжает в настройки браузера
 * строкой в base64, русским комментариям там не место. Встроенных функций
 * PAC в нём нет вовсе, только сравнение строк и арифметика: те из
 * встроенных, что разрешают имена, делают запросы к DNS напрямую, мимо
 * прокси, и блокируют выполнение; проверка по маске перебором списка
 * замедляла бы каждый запрос при полном списке.
 *
 * СИСТЕМНЫЙ ОБХОД выводится из SYSTEM_BYPASS_LIST при сборке, а не пишется
 * руками: один источник для обоих режимов прокси. '<local>' — «в хосте
 * нет точки», буквально правило браузера; из SYSTEM_BYPASS_LIST оно снято
 * на 7Б (под него подпадали IPv6-литералы и уходили напрямую), ветка
 * разбора оставлена на случай возврата отдельным решением (мастер-промт
 * 3.4) — флаг LOCAL сегодня false; 'a.b.c.d/n' — диапазон, сравнение
 * только для хоста, который сам IPv4-литерал.
 *
 * ДОМЕН БЕЗ МАСКИ НАКРЫВАЕТ ПОДДОМЕНЫ так же, как «*.example.com»: обе
 * записи означают «домен и всё под ним» (решение 09.09, подтверждено
 * человеком). Проверка — обходом меток хоста справа налево по
 * объекту-справочнику: host, потом всё после первой точки, и так до конца;
 * сравнение LIST[h] === 1 / === 2, чтобы «constructor» и прочие имена
 * прототипа не совпадали. IPv4-адрес в списке совпадает только целиком.
 *
 * ИСКЛЮЧЕНИЯ (7Ж, шаг 3, сценарий 9): строка списка «!host» — в LIST со
 * значением 2, кладётся после правил (при равной точности побеждает
 * исключение — «!a.com» перекрывает «a.com»). Обход меток останавливается
 * на первом найденном: 1 — хост в списке, 2 — не в списке, иначе дальше по
 * суффиксам: «!img10.joyreactor.cc» сильнее «joyreactor.cc», а
 * «img10.joyreactor.cc» сильнее «!joyreactor.cc». В чёрном режиме хост
 * под исключением идёт через прокси, в белом — напрямую. Для IPv4
 * исключений нет (разбор их пропускает). Маркер n= считает правила и
 * исключения вместе; сверка при старте читает из него только адрес.
 *
 * localhost, 127.*, [::1] браузер обходит сам во всех режимах — в скрипт
 * они не добавляются.
 *
 * АДРЕСА ПРОВЕРКИ СВЯЗИ (7Ж, находка человека 18.09): в белом режиме в
 * LIST добавляются хосты always (CHECK_HOSTS из constants.js — три чужих
 * адреса проверки связи), чтобы проверка при подключении шла через прокси
 * и при белом списке. В маркер n= они не входят — это счёт правил
 * человека; в чёрном режиме не добавляются.
 */

import { SYSTEM_BYPASS_LIST } from '../shared/constants.js';
import { hostPort, bypassNets } from '../shared/parse.js';
import { pacDirective, typeOfPacDirective } from '../shared/proxytype.js';   // 2.1: PROXY / HTTPS / SOCKS5 / SOCKS4

/* Тот же выбор «действуют ли списки», что у попапа: одна функция в parse.js. */
export { listsFrom } from '../shared/parse.js';

/** Знаки, которые вообще могут быть в адресе прокси: буквы, цифры, «.», «-», «_», «:», скобки IPv6. */
const ADDR_RE = /^[\w.\-:[\]]+$/;

/**
 * Системный обход для скрипта — из SYSTEM_BYPASS_LIST.
 *
 *   '<local>'    → флаг: хост без точки идёт напрямую
 *   'a.b.c.d/n'  → пара чисел [сеть, маска] для хоста-IPv4 — их считает
 *                  bypassNets из parse.js (один разбор на скрипт и попап)
 *
 * Запись другой формы — ошибка сборки (бросает bypassNets): applyProxy
 * покажет её как отказ настройки, а не пропустит молча. С нынешней
 * константой недостижимо.
 *
 * @param {readonly string[]} list
 * @returns {{local: boolean, nets: number[][]}}
 */
function directFrom(list) {
  return { local: list.includes('<local>'), nets: bypassNets(list) };
}

/*
 * Неизменная часть шаблона. ES5, без встроенных функций PAC.
 *
 * ipv4(h)        число из хоста-IPv4 либо -1
 * isSystem(h,ip) системный обход: диапазоны для IPv4, «нет точки» для имён
 * inList(h,ip)   есть ли хост в справочнике: IPv4 — только целиком,
 *                имя — обходом меток справа налево
 * главная функция скрипта: системный обход → напрямую; чёрный список:
 *                в списке → напрямую, иначе прокси; белый: в списке →
 *                прокси, иначе напрямую. Других выходов напрямую в скрипте
 *                нет — ровно три; у прокси хвоста с прямым соединением
 *                нет: при недоступном прокси запрос должен упасть, а не
 *                уйти напрямую (решение 08.09). url не используется —
 *                браузер и так режет его до схемы и хоста.
 */
const PAC_BODY = [
  'function ipv4(h) {',
  '  var parts = h.split(".");',
  '  if (parts.length !== 4) return -1;',
  '  var n = 0;',
  '  for (var i = 0; i < 4; i++) {',
  '    var p = parts[i];',
  '    if (p.length === 0 || p.length > 3) return -1;',
  '    for (var j = 0; j < p.length; j++) {',
  '      var c = p.charCodeAt(j);',
  '      if (c < 48 || c > 57) return -1;',
  '    }',
  '    var v = parseInt(p, 10);',
  '    if (v > 255) return -1;',
  '    n = n * 256 + v;',
  '  }',
  '  return n;',
  '}',
  'function isSystem(h, ip) {',
  '  if (ip >= 0) {',
  '    for (var i = 0; i < NETS.length; i++) {',
  '      if (((ip & NETS[i][1]) >>> 0) === NETS[i][0]) return true;',
  '    }',
  '    return false;',
  '  }',
  '  return LOCAL && h.indexOf(".") < 0;',
  '}',
  'function inList(h, ip) {',
  '  if (ip >= 0) return LIST[h] === 1;',
  '  while (true) {',
  '    var v = LIST[h];',
  '    if (v === 1) return true;',
  '    if (v === 2) return false;',
  '    var i = h.indexOf(".");',
  '    if (i < 0) return false;',
  '    h = h.slice(i + 1);',
  '  }',
  '}',
  'function FindProxyForURL(url, host) {',
  '  var h = String(host).toLowerCase();',
  '  if (h.charAt(h.length - 1) === ".") h = h.slice(0, h.length - 1);',
  '  var ip = ipv4(h);',
  '  if (isSystem(h, ip)) return "DIRECT";',
  '  var listed = inList(h, ip);',
  '  if (MODE === "black") return listed ? "DIRECT" : PROXY;',
  '  return listed ? PROXY : "DIRECT";',
  '}',
].join('\n');

/**
 * Собрать текст скрипта.
 *
 * Первая строка — комментарий-маркер с адресом прокси, режимом и числом
 * доменов: его читает сверка при старте (readMarker ниже). Адрес в маркере
 * стоит как есть — он уже проверен isValidAddr и портом в buildConfig, а
 * здесь ещё раз по набору знаков: ни пробела, ни «*», ни «/» в нём быть не
 * может, закрыть комментарий раньше времени нечем.
 *
 * Адрес прокси — через hostPort из parse.js: IPv6 в квадратных скобках,
 * вторая реализация не заводится.
 *
 * exceptions (шаг 3) — исключения из listsFrom(), в LIST со значением 2;
 * always (2′.2) — хосты, идущие через прокси и при белом списке (CHECK_HOSTS).
 * Оба необязательны: без них текст скрипта — как до шага 3 по составу LIST.
 *
 * type (2.1) — протокол записи: директива PAC выбирается по нему
 * (PROXY / HTTPS / SOCKS5 / SOCKS4) и попадает в маркер. Прежние вызовы
 * без type читаются как HTTP — это ровно прежнее поведение.
 *
 * @param {{host: string, port: number, type?: string, listMode: string, domains: string[], exceptions?: string[], always?: string[]}} p
 * @returns {string}
 */
export function buildPac({ host, port, type, listMode, domains, exceptions, always }) {
  const addr = hostPort({ ip: host, port });
  const directive = pacDirective(type);
  if (!ADDR_RE.test(addr)) throw new Error('buildPac: адрес прокси содержит недопустимые знаки');
  if (!Array.isArray(domains) || domains.length === 0) throw new Error('buildPac: список доменов пуст');

  const mode = listMode === 'white' ? 'white' : 'black';
  const exc = Array.isArray(exceptions) ? exceptions : [];
  const map = {};
  for (const d of domains) map[d] = 1;
  if (mode === 'white' && Array.isArray(always)) for (const d of always) map[d] = 1;   // адреса проверки — через прокси и при белом списке
  for (const d of exc) map[d] = 2;   // исключения — после правил: при равной точности побеждает исключение
  const direct = directFrom(SYSTEM_BYPASS_LIST);

  return [
    `/* pxs proxy=${addr} scheme=${directive.toLowerCase()} list=${mode} n=${domains.length + exc.length} */`,
    `var PROXY = ${JSON.stringify(directive + ' ' + addr)};`,
    `var MODE = ${JSON.stringify(mode)};`,
    `var LIST = ${JSON.stringify(map)};`,
    `var LOCAL = ${JSON.stringify(direct.local)};`,
    `var NETS = ${JSON.stringify(direct.nets)};`,
    PAC_BODY,
  ].join('\n');
}

/** Маркер первой строки — единственное регулярное выражение по «pxs proxy=».
    2.1: scheme необязателен — скрипт, записанный расширением до 2.1, читается
    как HTTP, и сверка при старте не считает его чужим. */
const MARKER_RE = /^\/\* pxs proxy=(\S+)(?: scheme=(http|https|socks5|socks4))? list=(black|white) n=(\d+) \*\//;

/**
 * Прочитать маркер из текста скрипта, который вернул браузер.
 * addr — в той же форме, что даёт hostPort: сверка сравнивает с ним.
 * scheme (2.1) — 'http' | 'https' | 'socks5' | 'socks4'; в скрипте до 2.1
 * поля нет, и тогда это HTTP.
 *
 * @param {*} text
 * @returns {null|{addr: string, scheme: string, type: string, listMode: 'black'|'white', n: number}}
 */
export function readMarker(text) {
  if (typeof text !== 'string') return null;
  const m = MARKER_RE.exec(text);
  if (!m) return null;
  const scheme = m[2] || 'http';
  return {
    addr: m[1],
    scheme,
    type: typeOfPacDirective(scheme),
    listMode: m[3],
    n: parseInt(m[4], 10),
  };
}
