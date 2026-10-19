/* src/shared/parse.js — разбор вставленных прокси, одна реализация на оба
   окна (этап 4), и с 7Ж — разбор списков доменов, один на окна и фон.
   До этапа 4 parseProxy жила в options.js (перенос из
   прототипа страницы), а у попапа было своё быстрое деление строки по
   разделителям — оно не различало форматы и подставляло порт 8080, когда
   его не было. Теперь запись из любого окна собирается здесь, в форме
   схемы PROXY: порт числом, тип 'HTTP', источник 'manual', заметки массивом.
   Идентификатор запись не получает — его даёт newProxyId() из state.js в
   момент добавления.

   ФОРМАТЫ (промт этапа 4):
     ip:port
     ip:port@логин:пароль
     ip:port:логин:пароль
     ip:port:логин                ← экспорт прокси без пароля
     логин:пароль@ip:port
     http://логин:пароль@ip:port  ← любая схема перед :// отбрасывается
     имена хостов (proxy.example.com:8080) и IPv6 в квадратных скобках
     ([2001:db8::1]:8080, [2001:db8::1]:8080:логин:пароль,
     логин:пароль@[2001:db8::1]:8080). В записи адрес хранится без скобок,
     скобки возвращает hostPort() при показе и выгрузке.

   ЗАМЕТКИ. Хвост после « #» (решётка после пробела) — заметки, так пишет
   наш экспорт: « #работа #два слова». Решётка считается началом хвоста
   только после пробела: в пароле она встречается, и разрывать его нельзя.
   Заметки разделяются « #», поэтому заметка из двух слов не разваливается
   на две. Всё, что в хвосте стоит до первой решётки, отбрасывается молча —
   файл должен оставаться годным для чужих программ, а они дописывают
   туда своё.

   СПИСКИ ДОМЕНОВ (7Ж, шаг 1 — переезд из pac.js, не копия). Разбор поля
   списка (normalizeDomains), выбор действующего списка по режиму
   (listsFrom; с 7Л — settings.listMode и два поля listBlack / listWhite,
   listField), разбор сетей системного обхода (bypassNets) и покрытие
   хоста правилом (coverage, inList) живут здесь, потому что с 7Ж их
   читает не только фон при сборке скрипта, но и попап — строке «Прокси
   для:» нужно знать, действуют ли списки и накрыт ли сайт вкладки. Смысл
   покрытия — ровно тот, что у inList в шаблоне pac.js (обход меток от
   полного хоста к суффиксам, IPv4 только целиком); стенд сверяет оба на
   одной матрице хостов. pac.js импортирует всё это отсюда и оставляет
   себе только шаблон и маркер.

   На верхнем уровне document и window не читаются: модуль можно
   импортировать и там, где документа нет. Обращений к браузеру здесь нет
   вовсе: файл гоняется в Node на стенде; new URL есть и в окнах, и в
   фоне, и в Node. */

import { SYSTEM_BYPASS_LIST } from './constants.js';
import { detectType, schemeOf } from './proxytype.js';

/** Сколько заметок у одной записи и какой длины каждая — как на странице. */
export const TAG_MAX = 4;
export const TAG_LEN = 16;

/* IPv4 строго: ровно четыре октета 0…255, без ведущих нулей */
const IPV4_RE = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/** Схема перед адресом — срезается до разбора: и у прокси, и у строки списка. */
const SCHEME_RE = /^[a-z][a-z0-9+.\-]*:\/\//i;

/**
 * Похож ли адрес на IP или имя хоста. Проверка формы, не существования:
 * жив ли прокси, узнаётся только подключением (проверка при подключении, probe.js).
 *  - только цифры и точки → обязан быть настоящим IPv4: «45.157.136.23413»
 *    браузер отвергает уже на уровне настройки (ERR_NO_SUPPORTED_PROXIES),
 *    и человек получал «включено» с мёртвыми страницами (найдено 08.09);
 *  - с двоеточиями → IPv6, форму проверяет разборщик адресов браузера;
 *  - иначе имя хоста: буквы, цифры, _, точка и дефис (как в прототипе), и
 *    разборщик адресов не должен его переиначить — так отсеиваются
 *    «proxy.1», «1.2.3» и прочее, что браузер не смог бы разрешить.
 * @param {string} ip
 */
export function isValidAddr(ip){
  if(typeof ip !== 'string' || !ip || ip.length > 255) return false;
  if(ip.includes(':')){
    if(!/^[0-9a-f:.]+$/i.test(ip)) return false;
    try{ new URL('http://[' + ip + ']/'); return true; }catch(err){ return false; }
  }
  if(!/^[\w.\-]+$/.test(ip)) return false;
  if(/^[\d.]+$/.test(ip)) return IPV4_RE.test(ip);
  try{ return new URL('http://' + ip + '/').hostname === ip.toLowerCase(); }catch(err){ return false; }
}

/* хост с портом: имя хоста или IPv4 — [\w.-]+, IPv6 — в квадратных скобках */
const HOST_RE = /^(\[[0-9a-f:.]+\]|[\w.\-]+):(\d{1,5})$/i;
const isHost = (x) => HOST_RE.test(x);
/* «похоже на адрес»: точка в имени, IPv6 в скобках — им отдаётся
   предпочтение, когда обе половины вокруг @ похожи на host:port
   (логин user и числовой пароль 1234 тоже читаются как host:port) */
const looksAddr = (x) => x.startsWith('[') || x.slice(0, x.lastIndexOf(':')).includes('.');

/* host:port → [host без скобок, port строкой] */
function splitHost(host){
  if(host.startsWith('[')){
    const j = host.indexOf(']');
    return [host.slice(1, j), host.slice(j + 2)];
  }
  const i = host.lastIndexOf(':');
  return [host.slice(0, i), host.slice(i + 1)];
}

/**
 * Разобрать одну строку. Не разобралась — null.
 * Экспорт — для стенда (parse.test); окна зовут parseProxyLines ниже.
 * @param {string} raw
 * Тип (с 2.1): явная схема в строке — точный источник (socks5://, socks4://,
 * http://, https://); без схемы тип берётся по порту и помечается
 * typeGuess: true (см. proxytype.js). Порт 1080 → SOCKS5, 8080/3128 → HTTP,
 * 443/8443 → HTTPS, остальное — HTTP, как было до 2.1.
 * @returns {{ip: string, port: number, type: string, typeGuess?: boolean, login: string, pass: string, src: 'manual', tags: string[]}|null}
 */
export function parseProxy(raw){
  let s = String(raw).trim();
  let tags = [];
  const scheme = schemeOf(s);
  const cut = s.match(/\s#/);
  if(cut){
    tags = s.slice(cut.index).split(/\s+#/)
      .map(t => t.replace(/^#/, '').trim().slice(0, TAG_LEN))
      .filter(Boolean).slice(0, TAG_MAX);
    s = s.slice(0, cut.index);
  }
  s = s.trim().replace(SCHEME_RE, '').replace(/\s+/g, '');
  if(!s) return null;
  let ip, port, login = '', pass = '';
  if(s.includes('@')){
    const i = s.lastIndexOf('@');
    const a = s.slice(0, i), b = s.slice(i + 1);
    let host, cred;
    if(isHost(a) && isHost(b)){
      /* обе половины похожи на host:port — берём ту, что больше похожа на адрес;
         при равенстве побеждает форма логин:пароль@ip:port (адрес после @) */
      if(looksAddr(a) && !looksAddr(b)){ host = a; cred = b; }
      else { host = b; cred = a; }
    }
    else if(isHost(b)){ host = b; cred = a; }
    else if(isHost(a)){ host = a; cred = b; }
    else return null;
    [ip, port] = splitHost(host);
    const c = cred.indexOf(':');
    if(c > -1){ login = cred.slice(0, c); pass = cred.slice(c + 1); } else login = cred;
  } else if(s.startsWith('[')){
    /* IPv6 в скобках без @: [адрес]:port[:логин[:пароль]] */
    const j = s.indexOf(']');
    if(j < 0 || s[j + 1] !== ':') return null;
    ip = s.slice(1, j);
    const p = s.slice(j + 2).split(':');
    port = p[0];
    if(p.length >= 2) login = p[1];
    if(p.length >= 3) pass = p.slice(2).join(':');
  } else {
    const p = s.split(':');
    if(p.length >= 4){ ip = p[0]; port = p[1]; login = p[2]; pass = p.slice(3).join(':'); }
    else if(p.length === 3){ ip = p[0]; port = p[1]; login = p[2]; }   /* экспорт прокси без пароля */
    else if(p.length === 2){ ip = p[0]; port = p[1]; }
    else return null;
  }
  /* порт — число в границах схемы; parseInt всегда, порты неоднородны */
  port = /^\d{1,5}$/.test(port || '') ? parseInt(port, 10) : NaN;
  if(!Number.isInteger(port) || port < 1 || port > 65535) return null;
  if(!isValidAddr(ip)) return null;
  /* 2.1: тип — из схемы либо по порту; догадка помечается, чтобы окна
     показали «SOCKS5*» и не выдавали её за факт */
  const { type, guess } = detectType(scheme, port);
  const rec = { ip, port, type, login, pass, src: 'manual', tags };
  if(guess) rec.typeGuess = true;
  return rec;
}

/**
 * Разобрать вставленный текст целиком. Разделители записей — перевод
 * строки, точка с запятой и табуляция. Нераспознанные строки возвращаются
 * как есть: окно показывает, сколько их, и может вернуть их в поле.
 * @param {string} text
 * @returns {{found: Object[], skipped: string[]}}
 */
export function parseProxyLines(text){
  const found = [], skipped = [];
  String(text).split(/[\n;\t]/).map(s => s.trim()).filter(Boolean).forEach(line => {
    const p = parseProxy(line);
    if(p) found.push(p); else skipped.push(line);
  });
  return { found, skipped };
}

/**
 * Адрес с портом для показа, выгрузки и буфера обмена: IPv6 — в скобках,
 * иначе строка не разобралась бы обратно.
 * @param {{ip: string, port: number|string}} p
 */
export const hostPort = p => (String(p.ip).includes(':') ? '[' + p.ip + ']' : p.ip) + ':' + p.port;

/* ═══════════ СПИСКИ ДОМЕНОВ (7Ж: переехало из pac.js, этап 5) ═══════════ */

/** Ведущие «*.» и «.» — снимаются повторно: «*.*.example.com» → «example.com». */
const MASK_RE = /^(\*\.|\.)+/;

/** Годное имя: строчные буквы, цифры, дефис, точки между метками. */
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;

/**
 * IPv4-литерал: только цифры и точки, и при этом настоящий адрес из четырёх
 * октетов 0…255 — это проверяет isValidAddr, второй проверки формы адреса
 * в проекте нет. Хост от браузера ведущих нулей в октетах не несёт
 * (разборщик адресов приводит «01.2.3.4» к «1.2.3.4»), так что и для
 * хоста вкладки, и для строки списка проверка одна.
 * Экспорт — для стенда (parse.test); в коде читается только в этом файле.
 * @param {string} s
 */
export const isIPv4 = (s) => /^[\d.]+$/.test(s) && isValidAddr(s);

/** IP-литерал любой версии: IPv4 либо адрес с двоеточиями (IPv6 без скобок). */
export const isIPHost = (h) => typeof h === 'string' && (h.includes(':') || isIPv4(h));

/**
 * Одна строка списка → имя хоста в канонической форме либо null.
 *
 * Разбор через new URL('http://' + строка): hostname даёт строчные буквы,
 * punycode для кириллицы, снимает логин, порт и путь. Протокол он НЕ
 * снимает — «http://пример.рф/путь» дал бы хост «http», поэтому схема
 * срезается до разбора (поправка к промту этапа 5, решение сессии).
 * Хвостовая точка снимается одна: «example.com.» — тот же домен.
 *
 * Экспортирована с 7Ж (шаг 2): попап сопоставляет строки поля с правилами
 * — при снятии убирает ровно те строки, что дают снимаемое правило, не
 * переписывая остальные; второго разбора строки в проекте нет.
 *
 * @param {string} line уже обрезанная и непустая
 * @returns {string|null}
 */
export function normalizeOne(line) {
  const s = line.replace(SCHEME_RE, '').replace(MASK_RE, '');
  if (!s) return null;

  let host;
  try {
    host = new URL('http://' + s).hostname;
  } catch (err) {
    return null;
  }

  if (host.endsWith('.')) host = host.slice(0, -1);
  if (!host) return null;
  if (DOMAIN_RE.test(host) || isIPv4(host)) return host;
  return null;
}

/** Строка-исключение: ведущий «!» (7Ж, шаг 3). Пробелы после «!» допустимы. */
const EXC_RE = /^!\s*/;

/**
 * Текст поля списка (listBlack или listWhite) → домены для скрипта и для
 * попапа.
 *
 * По строке на домен. Пустые строки — не в счёт, дубли снимаются и не
 * считаются ни доменами, ни пропущенными; skipped — только строки, из
 * которых имя не получилось. Ничего не бросает.
 *
 * 7Ж (шаг 3, сценарий 9): строка с ведущим «!» — исключение. После «!» та
 * же нормализация, что у правила; «!» перед IPv4 — строка пропускается
 * (исключения — только для имён: IPv4 совпадает целиком, исключать под
 * ним нечего). Исключения — отдельным массивом exceptions, дубли так же
 * снимаются; один и тот же хост может быть и правилом, и исключением —
 * при равной точности побеждает исключение (coverage ниже и шаблон pac.js).
 *
 * @param {string} text
 * @returns {{domains: string[], exceptions: string[], skipped: number}}
 */
export function normalizeDomains(text) {
  const domains = [];
  const exceptions = [];
  const seen = new Set();
  const seenExc = new Set();
  let skipped = 0;

  const lines = typeof text === 'string' ? text.split('\n') : [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (EXC_RE.test(line)) {
      const rest = line.replace(EXC_RE, '');
      const host = rest ? normalizeOne(rest) : null;
      if (host === null || isIPv4(host)) {
        skipped += 1;
        continue;
      }
      if (seenExc.has(host)) continue;
      seenExc.add(host);
      exceptions.push(host);
      continue;
    }
    const host = normalizeOne(line);
    if (host === null) {
      skipped += 1;
      continue;
    }
    if (seen.has(host)) continue;
    seen.add(host);
    domains.push(host);
  }

  return { domains, exceptions, skipped };
}

/**
 * Имя поля настроек, в котором лежит список режима (7Л): 'black' →
 * 'listBlack', 'white' → 'listWhite', 'off' и всё прочее → null. Одно
 * место на страницу, попап и listsFrom: кто читает или правит «выбранный
 * список», берёт имя поля отсюда.
 *
 * @param {*} listMode
 * @returns {'listBlack'|'listWhite'|null}
 */
export function listField(listMode) {
  return listMode === 'black' ? 'listBlack' : listMode === 'white' ? 'listWhite' : null;
}

/**
 * Что из настроек идёт в скрипт — и действуют ли списки вообще.
 *
 * 7Л (решение человека 19.09): режим один — settings.listMode; 'off' —
 * списки не действуют; 'black' читает settings.listBlack, 'white' —
 * settings.listWhite (второй список при этом не читается вовсе: он
 * хранится, но не действует). null — режим 'off' ИЛИ после нормализации
 * ПРАВИЛ выбранного списка ноль: PAC не включается вовсе, работает
 * fixed_servers как раньше. Режим при пустом списке не меняется —
 * автовключения и автовыключения нет, режим выбирает только человек.
 * Одни исключения списком не считаются (7Ж, шаг 3): исключать не из
 * чего. Это единственное правило «списки действуют» в проекте: фон
 * выбирает по нему режим, попап — подпись и тумблер строки «Прокси
 * для:»; второго правила не заводить. Форма ответа прежняя — pac.js,
 * proxy.js и service-worker.js её не заметили.
 *
 * @param {{listMode?: string, listBlack?: string, listWhite?: string}} settings
 * @returns {null|{listMode: 'black'|'white', domains: string[], exceptions: string[], skipped: number}}
 */
export function listsFrom(settings) {
  if (!settings) return null;
  const field = listField(settings.listMode);
  if (field === null) return null;
  const { domains, exceptions, skipped } = normalizeDomains(settings[field]);
  if (domains.length === 0) return null;
  return { listMode: settings.listMode, domains, exceptions, skipped };
}

/** Число из IPv4-адреса, уже проверенного isIPv4. */
function ipv4Int(s) {
  return s.split('.').reduce((n, p) => n * 256 + parseInt(p, 10), 0);
}

/**
 * Сети системного обхода из SYSTEM_BYPASS_LIST — парами чисел [сеть, маска]
 * для хоста-IPv4. Одна на скрипт (pac.js подставляет их в NETS) и на
 * попап (isSystemDirect ниже).
 *
 *   'a.b.c.d/n'  → [сеть, маска]
 *   '<local>'    → не сеть, а флаг «хост без точки» — здесь пропускается,
 *                  его читает directFrom в pac.js (в константе с 7Б его нет,
 *                  ветка оставлена на случай возврата отдельным решением)
 *
 * Запись другой формы — ошибка: applyProxy покажет её как отказ настройки,
 * а не пропустит молча. С нынешней константой недостижимо.
 *
 * @param {readonly string[]} [list]
 * @returns {number[][]}
 */
export function bypassNets(list = SYSTEM_BYPASS_LIST) {
  const nets = [];

  for (const entry of list) {
    if (entry === '<local>') continue;
    const m = /^([\d.]+)\/(\d{1,2})$/.exec(entry);
    const bits = m ? parseInt(m[2], 10) : NaN;
    if (!m || !isIPv4(m[1]) || bits > 32) {
      throw new Error(`bypassNets: запись системного обхода не разобрана: ${entry}`);
    }
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    nets.push([(ipv4Int(m[1]) & mask) >>> 0, mask]);
  }

  return nets;
}

/* ═══════════ ХОСТ ВКЛАДКИ И ПОКРЫТИЕ (7Ж, новое) ═══════════ */

/**
 * Хост в той форме, в какой его видит шаблон скрипта: строчными, без одной
 * хвостовой точки (так делает главная функция скрипта до всех проверок).
 * @param {string} host
 */
function hostKey(host) {
  let h = String(host).toLowerCase();
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

/**
 * Хост открытой вкладки — H. Только http и https: у служебных страниц
 * (chrome://, новая вкладка, магазин) сайта нет, и у вкладки без адреса
 * тоже. Строчными, IPv6 без квадратных скобок, без хвостовой точки —
 * как в шаблоне скрипта.
 *
 * @param {*} url tab.url, может отсутствовать
 * @returns {string|null}
 */
export function tabHost(url) {
  if (typeof url !== 'string' || !url) return null;
  let u;
  try {
    u = new URL(url);
  } catch (err) {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const h = hostKey(u.hostname.replace(/^\[|\]$/g, ''));
  return h || null;
}

/**
 * Метки второго уровня, при которых «весь сайт» — три метки, а не две:
 * news.bbc.co.uk → bbc.co.uk, а не co.uk.
 */
const SLD = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac']);

/**
 * «Весь сайт» — S для хоста H: родительский домен из последних двух меток;
 * трёх, если предпоследняя из SLD. IP-литерал и хост из одной-двух меток —
 * S = H. Это то, что строка попапа пишет в список тумблером.
 *
 * @param {string} host уже из tabHost
 * @returns {string}
 */
export function siteOf(host) {
  const h = hostKey(host);
  if (isIPHost(h)) return h;
  const p = h.split('.');
  if (p.length <= 2) return h;
  return p.slice(SLD.has(p[p.length - 2]) ? -3 : -2).join('.');
}

/**
 * Чем накрыт хост — самым точным правилом или исключением. Тот же смысл,
 * что inList в шаблоне pac.js: IPv4-хост совпадает только целиком (и только
 * с правилом — исключений для IPv4 нет); имя — обходом меток от полного
 * хоста к суффиксам, первое найденное и есть ответ (правило накрывает себя
 * и всё под собой; «*.» с него снята при разборе, «*.сайт» = «сайт»).
 * 7Ж (шаг 3, сценарий 9): на каждом шаге обхода исключение проверяется
 * раньше правила — при равной точности побеждает исключение;
 * «!img10.joyreactor.cc» сильнее «joyreactor.cc», а «img10.joyreactor.cc»
 * сильнее «!joyreactor.cc». В ответе заполнено ровно одно из двух полей
 * либо оба null. Стенд 7Ж сверяет с шаблоном на одной матрице хостов.
 *
 * @param {string[]} domains годные правила — из listsFrom()
 * @param {string} host
 * @param {string[]} [exceptions] исключения — из listsFrom(); без них — как раньше
 * @returns {{rule: string|null, exception: string|null}}
 */
export function coverage(domains, host, exceptions) {
  const set = new Set(Array.isArray(domains) ? domains : []);
  const exc = new Set(Array.isArray(exceptions) ? exceptions : []);
  let h = hostKey(host);
  if (isIPv4(h)) return { rule: set.has(h) ? h : null, exception: null };
  while (true) {
    if (exc.has(h)) return { rule: null, exception: h };
    if (set.has(h)) return { rule: h, exception: null };
    const i = h.indexOf('.');
    if (i < 0) return { rule: null, exception: null };
    h = h.slice(i + 1);
  }
}

/**
 * Накрыт ли хост правилом списка: true, только когда первое найденное по
 * обходу — правило (шаг 3). Экспорт — для стенда (parse.test, сверка с
 * inList шаблона PAC); попап читает coverage() выше, не это.
 * @param {string[]} domains
 * @param {string} host
 * @param {string[]} [exceptions]
 */
export function inList(domains, host, exceptions) {
  return coverage(domains, host, exceptions).rule !== null;
}

/**
 * Идёт ли хост напрямую всегда, мимо списков. Браузер сам обходит прокси
 * во всех режимах, и при PAC тоже (документация Chromium, «Implicit bypass
 * rules», сверено 18.09): localhost и *.localhost, [::1], 127.0.0.0/8,
 * 169.254.0.0/16 и [fe80::]/10 — link-local IPv6 (роутер по адресу вида
 * http://[fe80::1]/). IPv4 из сетей SYSTEM_BYPASS_LIST обходят fixed_servers
 * (bypassList) и скрипт (NETS) — 169.254.0.0/16 в обоих списках, остальные
 * три сети только в нашем. Имя loopback браузер обходит только на Windows,
 * 0.0.0.0/8 в списке Chromium нет — ни то ни другое сюда не входит.
 * Для такого хоста строка попапа говорит «напрямую — локальная сеть», и
 * тумблер недоступен: запись в список ничего бы не изменила (сценарий 12).
 *
 * IPv6-литерал от new URL приходит каноническим (строчные, сжатый), поэтому
 * первое 16-битное поле — просто текст до первого «:» как шестнадцатеричное
 * число; у «::1» оно пустое и в маску не попадает.
 *
 * @param {string} host
 */
export function isSystemDirect(host) {
  const h = hostKey(host);
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h === '::1') return true;
  if (h.includes(':')) return (parseInt(h.slice(0, h.indexOf(':')), 16) & 0xffc0) === 0xfe80;
  if (!isIPv4(h)) return false;
  if (h.startsWith('127.')) return true;
  const ip = ipv4Int(h);
  return bypassNets().some(([net, mask]) => ((ip & mask) >>> 0) === net);
}
