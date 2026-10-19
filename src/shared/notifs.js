/* src/shared/notifs.js — правила панели уведомлений, ОДНИ на попап и фон
   (7Г, 7.12; решения 15.09 и 17.09; 7З — область, таблица сроков по
   решению человека 22.09 после макета). Попап по этим карточкам рисует
   панель и число на колокольчике, фон — число на значке. Обращений к
   браузеру и к странице здесь нет: файл гоняется в Node на стенде (общий
   слой, который он импортирует, — format.js ради expDays и порогов, — при
   импорте трогает только переводчик строк браузера, у стенда это подделка).

   Вход правил — объект data (all / list): { proxies, account, state, notifs,
   settings, remote, version, lang, now } — копии ключей хранилища плюс
   версия расширения, сырой язык браузера и момент «сейчас» (см. JSDoc у
   all). Карточка — объект БЕЗ текстов: { kind, nid } плюс поля по виду —
   у сроков n, d, orders; у 'new' n; у 'gone' id, ip; у 'replaced' id, ip,
   newIp; у 'key' at, error; у событий at и id, ip, newIp из события; у
   'banner' id, level, icon, title, body, button?, url?, priority, sticky?
   (подробно — у видов ниже). Тексты, иконки, цвет и действие подбирает
   попап по kind; у фона текстов нет — ему нужны только число и цвет
   счётчика.

   Виды карточек:
     сроки (7З, макет 22.09: две карточки-таблицы вместо карточек по
     каждому прокси — одиночных, заказных и сводной):
       'badAll'    «Истекли»: все истёкшие адреса     nid  exp:all:<N>
       'warnAll'   «Истекают»: все истекающие          nid  soon:all:<N>
                   (за EXP_WARN_DAYS и меньше)
                   поля { n — прокси, d — ближайший срок, orders: [ строки
                   по заказам: { orderId | null, n, d, ips: [ { ip, port,
                   id?, cc?, acc } ] } ] } — заказ собирает все свои адреса,
                   добавленные и из аккаунта; адрес без номера заказа
                   (orderId не число — так бывает, только если сервер
                   прислал номер заказа не числом) — своей строкой с пустой
                   плашкой (7К.2, Г-7); ручные прокси срока не имеют и в таблицы
                   сроков не попадают; id — у прокси списка (попап ведёт
                   к его строке на странице), acc — адрес только в
                   аккаунте, в списке его нет.
                   N в nid — число прокси: закрытая карточка возвращается,
                   когда состав уровня изменился (как у 'new'); закрытие —
                   на сутки; непрочитанной уровень считается одной карточкой
     из данных, без событий — исчезают сами, когда исчезла причина:
       'new'       в аккаунте N новых прокси          nid  new:acc:<N> — N в
                   идентификаторе, чтобы закрытая карточка вернулась при
                   другом числе (хвост 3Б.0, находка человека 15.09)
       'gone'      прокси пропал из аккаунта          nid  gone:<id>
       'replaced'  у пропавшего прокси в аккаунте есть адрес того же заказа,
                   которого нет в списке              nid  replaced:<id>:<newIp>
       'key'       ключ API больше не действует       nid  key:<account.at>
     из событий фона (notifs.events, пишет только фон):
       'lost'      обрыв с переключением — на newIp, либо без newIp, когда
                   замены не нашлось                  nid  lost:<at>
       'healed'    самолечение переподключило         nid  healed:<at>
   'new' и 'replaced' — только при аккаунте без error (как accNew попапа
   до 7Г). 'replaced' и 'gone' у одного прокси не встречаются вместе:
   пока новый адрес не добавлен — «заменён», добавили — «пропал» у старой
   записи (решение 17.09, п. 3).
   Прежние nid 7Г одиночных карточек сроков (exp:<id>, soon:<id>) больше не
   строятся; их метки в хранилище вычищает prune при первой же записи попапа.
     из файла сообщений proxys.io (7И, data.remote — кеш remote):
       'banner'    сообщение разработчиков             nid  banner:<id>
                   поля { id, level, icon, title, body, button?, url?,
                   priority } — тексты ИЗ ФАЙЛА, попап показывает их только
                   через esc(); url проверен разбором (https на хост сайта).
                   Показывается только на языке браузера (data.lang —
                   сырой язык браузера, uiLang; uk → ru, иной → en), только
                   в окне from/until по data.now и только в диапазоне
                   minVersion/maxVersion по data.version (строка версии
                   расширения из манифеста; без версии фильтр не действует;
                   сравнение по частям, «2.0.10» > «2.0.9»). Порядок между
                   баннерами — priority по убыванию, потом как в файле.
                   Закрытая — навсегда (dismissed); баннер, пропавший из
                   файла (или вышедший из окна/версии), уносит метку через
                   prune. sticky (правка человека 24.09): карточку закрыть
                   нельзя — крестика нет, «Закрыть всё» её не трогает, метка
                   dismissed не действует; уходит только вместе с сообщением
                   из файла или по until (closable(card) — одно правило на
                   попап). Уровень (решение человека 23.09): urgent —
                   «Срочно» (тон bad, рядом с «Истекли»), important —
                   «Важно» (тон warn, рядом с «Истекают»), normal —
                   «Классическое» (тон info, последними, после «новых»).
   'key' с 7И несёт error аккаунта ('bad' | 'expired' | 'empty' — правка
   человека 24.09: код API 1002 «заказов не найдено»); nid прежний.

   ТОН КАРТОЧКИ (7И, решение человека 23.09) — одна таблица TONE здесь на
   попап (класс карточки и цвет числа на колокольчике) и фон (цвет плашки
   значка): 'bad' — красный («Истекли», «не отвечает», баннер urgent),
   'warn' — жёлтый («Истекают», «ключ», «пропал», баннер important),
   'info' — нейтральный, тёмная плашка («новых в аккаунте» — классическое,
   ответ человека 23.09; «самолечение», «заменён», баннер normal).
   toneOf(card) — тон одной карточки, tone(cards) — сильнейший среди
   переданных (обычно unreadCards): bad > warn > info, пусто — null.
   urgent(cards) остаётся и равен tone === 'bad'. Новые уровни и цвета —
   на будущее (слово человека 23.09): сейчас только эти три.

   Область уведомлений о сроках (7З, settings.notifScope — NOTIF_SCOPES,
   умолчание 'added'): 'off' — карточек сроков нет вовсе; 'added' — только
   прокси из списка (как до 7З); 'picked' — только отмеченные адреса
   settings.notifWatch, и из списка, и из аккаунта (правка человека 22.09:
   при «Выбранных» человек выбирает среди всех прокси по ключу, добавленных
   тоже); 'all' — весь список плюс все адреса аккаунта. Адрес аккаунта
   считается только когда его нет в списке (по ip:port) — иначе он уже
   учтён как добавленный; без аккаунта (ключ не привязан) и при
   account.error 'picked' и 'all' действуют как 'added'; бессрочный (exp
   null / expUnlimited) не считается.
   От области зависят ТОЛЬКО сроки: 'gone', 'replaced', 'new', 'key' и
   события фона показываются при любой области. data.settings передают фон
   (readAll) и попап; без settings — область 'added'.

   Метки (notifs.seen и notifs.dismissed — карты nid → мс, пишет попап):
     dismissed — карточка закрыта крестиком или «Закрыть всё»: сроки
                 (обе карточки-таблицы) возвращаются через SNOOZE (сутки),
                 остальное закрыто навсегда;
     seen      — панель открывали: карточка остаётся, но непрочитанной уже
                 не считается; у сроков метка тоже истекает через SNOOZE —
                 вернувшаяся карточка снова непрочитанная.
   Непрочитанные — карточки списка без действующей метки seen (unreadCards):
   фон и попап считают их длину сами, одним правилом — число на
   колокольчике и на значке совпадают всегда (на значке больше девяти —
   «9+», это уже badge.js); unread() остаётся для стенда.

   Порядок в панели (решение 17.09, п. 4): сначала требующие действия —
   «Истекли», «не отвечает» без замены, ключ не действует; потом события по
   времени, новые сверху, — переключились, самолечение; потом «Истекают»;
   потом пропал / заменён в порядке списка; «новых в аккаунте» — последней. */
import { expDays, EXP_WARN_DAYS } from './format.js';
import { BANNER_LANGS, BANNER_LEVELS, NOTIF_EVENT_KINDS, NOTIF_SCOPES } from './constants.js';

/* сутки молчания у закрытого предупреждения о сроке — и у его метки seen;
   экспорт — для стенда (g-notifs), в коде читается только здесь */
export const SNOOZE = 864e5;
/* какие карточки закрываются на время, а не навсегда: карточки сроков */
const SNOOZED = Object.freeze(['badAll', 'warnAll']);
export const snoozes = kind => SNOOZED.includes(kind);

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const addr = p => `${p.ip}:${p.port}`;

/* ── тон (7И, решение человека 23.09) — единственная таблица «вид → тон» и
   «уровень баннера → тон»; цвета плашки значка по тону — в badge.js,
   класс карточки и цвет числа на колокольчике — в попапе ── */
const TONE = Object.freeze({ badAll:'bad', lost:'bad', warnAll:'warn', key:'warn', gone:'warn', new:'info', replaced:'info', healed:'info' });
const LEVEL_TONE = Object.freeze({ urgent:'bad', important:'warn', normal:'info' });
const TONE_RANK = Object.freeze({ bad:3, warn:2, info:1 });
/**
 * Тон одной карточки: 'bad' | 'warn' | 'info'. Баннер — по уровню;
 * незнакомый вид — 'info'.
 * @param {Object} card
 * @returns {'bad'|'warn'|'info'}
 */
export function toneOf(card){
  if(!isObj(card)) return 'info';
  if(card.kind === 'banner') return LEVEL_TONE[card.level] || 'info';
  return TONE[card.kind] || 'info';
}
/**
 * Сильнейший тон среди карточек (обычно — непрочитанных): по нему фон
 * красит плашку значка, попап — число на колокольчике. Пусто — null.
 * @param {Object[]} cards
 * @returns {'bad'|'warn'|'info'|null}
 */
export function tone(cards){
  let best = null;
  for(const x of (Array.isArray(cards) ? cards : [])){
    const t = toneOf(x);
    if(best === null || TONE_RANK[t] > TONE_RANK[best]) best = t;
  }
  return best;
}

/* порядок групп в панели; внутри группы — свой порядок (см. all). Баннеры
   (7И): urgent — после «Истекли», important — после «Истекают», normal —
   после «новых», последними */
const RANK = { badAll:0, bannerUrgent:0.5, lostNone:1, key:2, event:3, warnAll:4, bannerImportant:4.5, gone:5, replaced:5, new:6, bannerNormal:7 };
const BANNER_RANK = { urgent:RANK.bannerUrgent, important:RANK.bannerImportant, normal:RANK.bannerNormal };
const rank = x => x.kind === 'lost' ? (x.newIp ? RANK.event : RANK.lostNone)
              : x.kind === 'healed' ? RANK.event
              : x.kind === 'banner' ? BANNER_RANK[x.level]
              : RANK[x.kind];

/* язык сообщений по языку браузера (data.lang — сырой uiLang: 'ru',
   'ru-RU', 'uk', 'en-US' …): uk → ru, всё, что не ru/uk, — en.
   Экспорт — для стенда (notifs.test); в коде зовёт только banners() ниже */
export function bannerLang(ui){
  const s = typeof ui === 'string' ? ui.toLowerCase() : '';
  return (s === 'ru' || s === 'uk' || s.startsWith('ru-') || s.startsWith('uk-')) ? 'ru' : 'en';
}

/* сравнение версий «2.0.10» и «2.0.9» по частям: 1 / 0 / -1; негодная
   строка — NaN (сравнение не применяется). Экспорт — для стенда
   (notifs.test); в коде зовёт только banners() ниже */
export function cmpVersion(a, b){
  if(typeof a !== 'string' || typeof b !== 'string' || !/^\d+(\.\d+)*$/.test(a) || !/^\d+(\.\d+)*$/.test(b)) return NaN;
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  const n = Math.max(pa.length, pb.length);
  for(let i = 0; i < n; i++){
    const x = pa[i] || 0, y = pb[i] || 0;
    if(x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

/**
 * Карточки баннеров из кеша файла сообщений (7И): только язык браузера,
 * только в окне from/until и в диапазоне версий; порядок — priority по
 * убыванию, потом как в файле. Поля — как оставил parseConfig, тексты
 * не трогаются (их экранирует попап).
 */
function banners(remote, lang, version, now){
  const list = isObj(remote) && Array.isArray(remote.banners) ? remote.banners.filter(isObj) : [];
  const want = bannerLang(lang);
  const ver = typeof version === 'string' && /^\d+(\.\d+)*$/.test(version) ? version : '';
  const out = [];
  list.forEach((b, i) => {
    if(typeof b.id !== 'string' || !b.id || typeof b.title !== 'string' || typeof b.body !== 'string') return;
    if(!BANNER_LANGS.includes(b.lang) || b.lang !== want) return;
    if(Number.isFinite(b.from) && now < b.from) return;
    if(Number.isFinite(b.until) && now > b.until) return;
    if(ver){
      if(typeof b.minVersion === 'string' && cmpVersion(ver, b.minVersion) < 0) return;
      if(typeof b.maxVersion === 'string' && cmpVersion(ver, b.maxVersion) > 0) return;
    }
    const x = { kind:'banner', nid:`banner:${b.id}`, id:b.id, level:BANNER_LEVELS.includes(b.level) ? b.level : 'normal', icon:typeof b.icon === 'string' ? b.icon : 'info', title:b.title, body:b.body, priority:Number.isFinite(b.priority) ? b.priority : 0, i };
    if(typeof b.button === 'string' && b.button && typeof b.url === 'string' && b.url){ x.button = b.button; x.url = b.url; }
    if(b.sticky === true) x.sticky = true;
    out.push(x);
  });
  out.sort((a, b) => b.priority - a.priority || a.i - b.i);
  return out.map(({ i, ...x }) => x);
}

/* область уведомлений о сроках: только значение из списка, иначе умолчание */
const scopeOf = settings => isObj(settings) && NOTIF_SCOPES.includes(settings.notifScope) ? settings.notifScope : 'added';
/* отмеченные адреса при 'picked' — множество строк 'ip:port' */
const watchOf = settings => new Set(
  isObj(settings) && Array.isArray(settings.notifWatch) ? settings.notifWatch.filter(s => typeof s === 'string') : []);

/* дни до конца аренды у записи со сроком; null — срока нет (ручной,
   бессрочный) */
function daysOf(rec){
  if(!rec.exp || rec.expUnlimited === true) return null;
  return expDays(rec);
}

/**
 * Карточки сроков по области (7З, п. 3) — две таблицы, «Истекли» и
 * «Истекают» (макет человека 22.09). Кандидаты — прокси списка (порядок
 * списка), затем адреса аккаунта, которых в списке нет; одна пара ip:port —
 * один адрес. Адреса одного заказа — одной строкой (добавленные и из
 * аккаунта вместе); без заказа — по одному. Строка уровня — по ближайшему
 * сроку среди её адресов; истёкшие строки — недавние первыми, истекающие —
 * ближайшие первыми.
 */
function deadlines(list, items, scope, watch, inList){
  if(scope === 'off') return [];
  const src = [];   /* { key, ip, port, cc, d, orderId, acc } */
  const seen = new Set();
  const take = (rec, acc) => {
    const key = addr(rec);
    if(seen.has(key)) return;
    if(scope === 'picked' && !watch.has(key)) return;   /* «Выбранные» — только отмеченные, и добавленные тоже */
    const d = daysOf(rec);
    if(d === null || d > EXP_WARN_DAYS) return;
    seen.add(key);
    const row = { key, ip:rec.ip, port:rec.port, d, orderId:Number.isInteger(rec.orderId) ? rec.orderId : null, acc };
    if(typeof rec.cc === 'string' && rec.cc) row.cc = rec.cc;
    if(!acc && typeof rec.id === 'string') row.id = rec.id;   /* прокси списка — попап ведёт к его строке на странице */
    src.push(row);
  };
  for(const p of list) take(p, false);
  if(scope === 'all' || scope === 'picked'){
    for(const a of items) if(!inList.has(addr(a))) take(a, true);
  }
  /* строки: заказ — по orderId, остальное — по одному */
  const byOrder = new Map();
  const rows = [];
  for(const r of src){
    const ipRec = { ip:r.ip, port:r.port, acc:r.acc };
    if(r.id) ipRec.id = r.id;
    if(r.cc) ipRec.cc = r.cc;
    if(r.orderId === null){ rows.push({ orderId:null, n:1, d:r.d, ips:[ipRec] }); continue; }
    let row = byOrder.get(r.orderId);
    if(!row){ row = { orderId:r.orderId, n:0, d:r.d, ips:[] }; byOrder.set(r.orderId, row); rows.push(row); }
    row.ips.push(ipRec);
    row.n += 1;
    if(r.d < row.d) row.d = r.d;
  }
  const out = [];
  const bad = rows.filter(x => x.d < 0).sort((a, b) => b.d - a.d);
  const warn = rows.filter(x => x.d >= 0).sort((a, b) => a.d - b.d);
  const level = (arr, kind, pre) => {
    if(!arr.length) return;
    const n = arr.reduce((s, x) => s + x.n, 0);
    out.push({ kind, nid:`${pre}:all:${n}`, n, d:arr[0].d, orders:arr });
  };
  level(bad, 'badAll', 'exp');
  level(warn, 'warnAll', 'soon');
  return out;
}

/**
 * Все карточки, которые вообще могли бы показаться, — до отсева закрытых.
 * Ими же попап чистит метки: nid, которого здесь нет, из seen и dismissed
 * уходит (prune), иначе карты росли бы вечно.
 *
 * @param {{proxies?: Object[], account?: Object|null, state?: Object, notifs?: Object, settings?: Object, remote?: Object|null, version?: string, lang?: string, now?: number}} data
 *   state пока не читается — оставлен по контракту промта 7Г: карточки по
 *   состоянию (обрыв без переключения) не заводятся, при закрытых окнах
 *   ошибку показывает красная метка на значке (решение 15.09, п. 3);
 *   settings (7З) — notifScope и notifWatch, без них область 'added';
 *   remote, version, lang, now (7И) — баннеры файла сообщений: кеш remote,
 *   версия расширения из манифеста, сырой язык браузера, момент «сейчас»
 *   (без now — Date.now())
 * @returns {Object[]} карточки в порядке показа
 */
export function all(data){
  const d = isObj(data) ? data : {};
  const list = Array.isArray(d.proxies) ? d.proxies.filter(isObj) : [];
  const account = isObj(d.account) ? d.account : null;
  const events = isObj(d.notifs) && Array.isArray(d.notifs.events) ? d.notifs.events.filter(isObj) : [];
  const settings = isObj(d.settings) ? d.settings : {};
  const now = Number.isFinite(d.now) ? d.now : Date.now();
  const out = [];

  const inList = new Set(list.map(addr));
  const accOk = account !== null && !account.error;
  const items = accOk && Array.isArray(account.items) ? account.items.filter(isObj) : [];

  /* сроки — по области (7З), две карточки-таблицы. Без аккаунта (ключ не
     привязан) или при account.error 'picked' и 'all' действуют как 'added'
     — как и на странице, где эти положения без ключа заперты (ответ 22.09,
     6): иначе отвязка ключа при «Выбранных» молча гасила бы сроки
     добавленных */
  const scope = scopeOf(settings);
  const eff = !accOk && (scope === 'picked' || scope === 'all') ? 'added' : scope;
  out.push(...deadlines(list, items, eff, watchOf(settings), inList));

  /* пропавшие из аккаунта и их замены: адрес того же заказа, которого
     в списке нет; отданный замене адрес в счёт новых не входит */
  const claimed = new Set();
  for(const p of list){
    if(p.gone !== true) continue;
    const rep = Number.isInteger(p.orderId)
      ? items.find(a => a.orderId === p.orderId && !inList.has(addr(a)) && !claimed.has(addr(a)))
      : undefined;
    if(rep){
      claimed.add(addr(rep));
      out.push({ kind:'replaced', nid:`replaced:${p.id}:${rep.ip}`, id:p.id, ip:p.ip, newIp:rep.ip });
    }
    else out.push({ kind:'gone', nid:`gone:${p.id}`, id:p.id, ip:p.ip });
  }

  /* новые в аккаунте — не тревога, а предложение */
  const fresh = items.filter(a => !inList.has(addr(a)) && !claimed.has(addr(a))).length;
  if(fresh > 0) out.push({ kind:'new', nid:`new:acc:${fresh}`, n:fresh });

  /* ключ отвергнут сервером: обновления остановлены, пока ключ не заменят;
     error — причина для текста карточки (7И: 'empty' — заказов не найдено) */
  if(account !== null && account.error) out.push({ kind:'key', nid:`key:${account.at}`, at:account.at, error:account.error });

  /* баннеры файла сообщений (7И) — на языке браузера, в окне дат и версий */
  out.push(...banners(d.remote, d.lang, d.version, now));

  /* события фона — только годные: вид из списка, идентификатор строкой */
  const ev = events
    .filter(e => NOTIF_EVENT_KINDS.includes(e.kind) && typeof e.nid === 'string' && e.nid)
    .map(e => {
      const x = { kind:e.kind, nid:e.nid, at:Number.isFinite(e.at) ? e.at : 0 };
      if(typeof e.id === 'string') x.id = e.id;
      if(typeof e.ip === 'string') x.ip = e.ip;
      if(typeof e.newIp === 'string' && e.newIp) x.newIp = e.newIp;
      return x;
    });
  ev.sort((a, b) => b.at - a.at);
  out.push(...ev);

  /* устойчивая сортировка по группам: внутри группы порядок сохраняется */
  return out.map((x, i) => [x, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
}

/* действует ли метка: без метки — нет; у сроков истекает через SNOOZE */
function marked(at, kind, now){
  if(!Number.isFinite(at)) return false;
  return !(snoozes(kind) && now - at >= SNOOZE);
}

/**
 * Можно ли закрыть карточку крестиком (7И, правка человека 24.09): всё, кроме
 * баннера с sticky. По нему попап рисует крестик и собирает «Закрыть всё»;
 * list() по нему же не даёт метке dismissed спрятать sticky-баннер (метка
 * могла остаться с тех пор, когда сообщение ещё было закрываемым).
 * @param {Object} card
 * @returns {boolean}
 */
export function closable(card){
  return !(isObj(card) && card.kind === 'banner' && card.sticky === true);
}

/**
 * Карточки к показу: все, кроме закрытых (dismissed). Это и есть панель
 * попапа, и по этому же списку считаются непрочитанные.
 *
 * @param {{proxies?: Object[], account?: Object|null, state?: Object, notifs?: Object, settings?: Object, now?: number}} data
 * @returns {Object[]}
 */
export function list(data){
  const d = isObj(data) ? data : {};
  const now = Number.isFinite(d.now) ? d.now : Date.now();
  const dismissed = isObj(d.notifs) && isObj(d.notifs.dismissed) ? d.notifs.dismissed : {};
  return all(d).filter(x => !closable(x) || !marked(dismissed[x.nid], x.kind, now));
}

/**
 * Непрочитанные из списка к показу: без действующей метки seen.
 *
 * @param {Object[]} cards результат list()
 * @param {Object} notifs ключ notifs (нужна карта seen)
 * @param {number} now
 * @returns {Object[]}
 */
export function unreadCards(cards, notifs, now){
  const seen = isObj(notifs) && isObj(notifs.seen) ? notifs.seen : {};
  const t = Number.isFinite(now) ? now : Date.now();
  return (Array.isArray(cards) ? cards : []).filter(x => !marked(seen[x.nid], x.kind, t));
}

/**
 * Число непрочитанных — одно на значок и колокольчик. Экспорт — для стенда
 * (notifs.test, g-notifs): фон и попап считают unreadCards(…).length сами,
 * как urgent() ниже — для стендов и совместимости.
 *
 * @param {Object[]} cards результат list()
 * @param {Object} notifs
 * @param {number} now
 * @returns {number}
 */
export function unread(cards, notifs, now){
  return unreadCards(cards, notifs, now).length;
}

/**
 * Среди непрочитанных есть требующее красного: истёкшие («Истекли», 7З),
 * обрыв, с 7И — баннер уровня «Срочно». То же, что tone(cards) === 'bad';
 * фон и попап с 7И берут цвет из tone(), urgent остаётся для стендов и
 * совместимости.
 *
 * @param {Object[]} cards обычно — результат unreadCards()
 * @returns {boolean}
 */
export function urgent(cards){
  return tone(cards) === 'bad';
}

/**
 * Карта меток без nid, которых нет среди карточек: перед записью попап
 * пропускает через это seen и dismissed с результатом all() — закрытая
 * «новых 3» после появления «новых 5» уходит, метки удалённого прокси
 * и вытесненного события тоже (и метки прежних одиночных карточек сроков
 * 7Г — с 7З их nid не строятся).
 *
 * @param {Object} marks карта nid → мс
 * @param {Object[]} cards результат all()
 * @returns {Object} новая карта
 */
export function prune(marks, cards){
  const keep = new Set((Array.isArray(cards) ? cards : []).map(x => x.nid));
  const out = {};
  if(!isObj(marks)) return out;
  for(const nid of Object.keys(marks)) if(keep.has(nid)) out[nid] = marks[nid];
  return out;
}
