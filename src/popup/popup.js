/* src/popup/popup.js — скрипт окна попапа. Перенос прототипа
   Попап_v13_2026-09-05.html на этапе 3Б.2, по существу без изменений.
   Подключается как <script type="module"> — иначе не работают импорты
   общего слоя. Всё, что отличается от прототипа, помечено «3Б.2» в коде:
   · тексты — из _locales через msg()/msgN() из i18n.js, пары I18N/L нет;
   · срок, страны, флаги, цвет заметки, тост и пять иконок — из src/shared/;
   · атрибут темы — на <html>; до первой отрисовки его ставит theme.js;
   · строка поиска ищет и по названию страны (пометка «3Б.1» из прототипа
     закрыта); с 3Б.6 это proxyHay из format.js, там же hasGeo; солнце и
     луна кнопки темы — iconSun/iconMoon из icons.js, $, $$ и esc — из
     dom.js, пороги срока EXP_WARN_DAYS/EXP_BAD_DAYS — из format.js;
     строка прототипа с lang в applyStatic и 'use strict' сняты (всё 3Б.6);
   · случайного отказа в connect() и функции failKind нет;
   · стенда (#stand, applyState, standMark, scn) нет;
   · глобуса и меню языка нет — решение 07.09 при проверке (язык задаёт браузер);
   · переменная активного прокси переименована в activeProxyId — прежнее имя
     из прототипа стоит в таблице 3.12 мастер-промта как запрещённый синоним.
   Этап 4 (пометки «этап 4» в коде): демо-данных нет — список, активный
   прокси, питание и настройки читаются из хранилища через state.js и
   перерисовываются по подписке; включение и выключение — сообщения фону
   ({ cmd:'enable'|'switch'|'disable' }), результат засчитывается только
   тому прокси и тому поколению, для которых стартовал; быстрое добавление
   разбирает строки parse.js общего слоя; тосты-обещания стали переходами
   на страницу расширения (признак раздела — временная область хранилища)
   и в корзину proxys.io; тема пишется в settings.theme, до первой
   отрисовки её даёт параметр адреса окна (см. theme.js). В памяти окна
   (помимо копий ключей хранилища) — busy, heroErr/heroErrT и поколение
   попытки connGen, а с поздних сессий ещё reconn/reconnT/reconnMsg (4.2),
   deadT (7В), tipFor/tipT и pmQuery (подсказка и поиск меню), cqState/cqMoveT
   (сцена), tabInfo/tabId, pageRec, lastRule, treeOpen (7Ж), xpOpen/rowOpen
   (7З); закрытые и прочитанные уведомления с 7Г — в ключе хранилища notifs,
   не в памяти.
   4.1 (пометки «4.1»): openPage() ищет открытую вкладку страницы среди своих
   контекстов. 4.2 (пометки «4.2»): смена прокси на лету держит картинку
   расстыковки не короче 0,62 с — reconnect(); в памяти окна ещё reconn.
   7В (пометки «7В», решения человека 11.09): пока фон держит state.probing
   при включённом прокси — коннектор в состоянии подключения и та же
   подпись «Подключение», тост «Подключено: …» ждёт конца проверки;
   переключение, сделанное фоном при обрыве, показывается как ручная
   смена (картинка расстыковки без команды фону, тост lostSwitched вместо
   «Ошибка подключения»); в памяти окна ещё deadT. Результат проверки без
   кода на экран не выходит — только в диагностику страницы.
   7Г (пометки «7Г»): панель уведомлений считает notifs.js общего слоя —
   те же правила, что у счётчика на значке в фоне; закрытые (dismissed) и
   прочитанные (seen) карточки лежат в ключе хранилища notifs и переживают
   закрытие попапа (баг человека 15.09 закрыт); открытие панели гасит
   число на значке и колокольчике, карточки остаются; новые виды карточек
   — не отвечает, самолечение, пропал, заменён, ключ не действует;
   «Продлить» ведёт в кабинет (urlMy, ответ разработчиков 15.09).
   7Ж (пометки «7Ж», прототип Попап_v25, сценарии 1–12 плана): строка
   «Прокси для:» над строкой «Списки» — сайт открытой вкладки и тумблер «прокси
   действует на сайт», панель «Адреса страницы» поверх окна — весь сайт
   и точный адрес по отдельности. Второго хранения нет: строка и панель
   правят те же поля списков в settings, что и страница настроек; правило
   «действуют ли списки» и покрытие хоста — из parse.js, те же, что у
   скрипта фона. Вкладка читается один раз при старте (chrome.tabs.query
   без разрешения tabs — адрес даёт host_permissions), значок сайта — из
   кэша браузера по разрешению favicon. Каждая запись списков из попапа
   идёт через writeLists (в 7Ж — с командой фону и перезагрузкой вкладки;
   снято 7Л, см. ниже). В памяти окна ещё tabInfo — адрес и хост вкладки.
   7Л, шаг 1 (пометки «7Л» в коде; решение человека 19.09): модель списков
   заново — режим settings.listMode ('off' | 'black' | 'white') и два
   независимых списка settings.listBlack / settings.listWhite; поля
   listDomains и listOn сняты 7Л. Вместо группы «тип + тумблер» — селектор
   режима #lstSeg «Выкл · Чёрный · Белый», он пишет только listMode (В2);
   плашка «Нет добавленных доменов» и её крестик сняты.
   Строка и панель правят выбранный список (listField); при «Выкл» тумблер
   строки включён и заперт (В1), при выбранном списке без правил — по
   правилу В1/В8 (белый: тумблер выключен, хотя трафик пока через прокси).
   Автовключения чёрного списка, сценария 10 и варианта 10б нет. Команды
   lists фону нет — запись идёт через state.patchSettings, фон применяет по
   подписке, вкладка не перезагружается никогда (В7).
   7Л, шаг 2 (пометки «шаг 2»): при «Выкл» щелчок по запертому тумблеру
   (строки или панели) или по строке — плашка выбора #pick «Списки выключены.
   Включить: Чёрный / Белый / Отмена», выбор только включает режим (п. 3, В5);
   тумблер строки действует и на сайты сторонних адресов страницы из учёта
   запросов (extSites, тот же жест, одна запись, тост «… и ещё N сайтов» —
   В3; корень панели — только сайт, сторонние в панели по одному); панель
   пишет сразу — черновик, плашка «Изменений: N» и вопрос «Выйти/Остаться»
   сняты (п. 9); глобус перерисован (п. 10); ⓘ строки — причина + фраза о
   правиле во всех вкладках + откуда взять сторонние адреса; тост наверху
   окна — правка человека 20.09.
   7Л, правки человека 20.09 (после выдачи шага 2; компоновка В2 по прототипу):
   строка #lists — подпись «Списки» с иконкой блокнота (копия ICON_LIST в
   разметке) и селектор во всю ширину с полными подписями, кнопка настроек
   отдельной строкой ниже; запертый при «Выкл» тумблер строки и панели живой
   — обёртке класс lock (курсор-рука, подсветка) и подсказка lockTip; плашка
   выбора — колодец на месте строк «Списки» и «Настройки» (top ставит
   openPick), остриё к тумблеру, «Чёрный» заливкой, «Белый» обводкой,
   «Отмена» — крестик #pickCancel, фокус при открытии на самой плашке.
   Правки человека 20.09 (после проверки 7L-3): пузырь подсказки не шире
   самой длинной строки (showTip); подпись «Списки» — кнопка в раздел списков
   страницы (openPage lists); тумблер строки после записи списка при
   settings.reload просит фон перезагрузить вкладку (команда siteReload —
   только строка, не панель и не селектор).
   7Л, шаг 3 (пометки «шаг 3»): плашка «N запросов» в панели — кнопка
   (.sp-rq, data-rq — хост / data-rqsite — сайт группы), openRequests
   открывает страницу src/requests/requests.html?tab=…&host=… (или &site=…,
   &theme=light) новой вкладкой. Вызовов chrome.tabs.create в окне четыре:
   openPage (страница расширения), «Продлить в кабинете» в панели
   уведомлений (urlMy), кнопка баннера файла сообщений (7И) и эта страница
   запросов.
   7И (пометки «7И»; решения человека 23.09 и 24.09): баннеры файла сообщений
   proxys.io — карточки kind 'banner' из кеша remote (копия ключа, как account):
   тексты из файла только через esc(), значок по icon (новый N_INFO «!» в
   круге), тон по уровню, кнопка открывает адрес баннера новой вкладкой
   (chrome.tabs.create — перечень вызовов у шага 3 7Л выше; адрес из
   карточки, проверен разбором фона, в разметку не попадает); тон карточки и цвет числа на колокольчике — из
   notifs.js (toneOf / tone): нейтральные непрочитанные — тёмное число (.info),
   а не жёлтое; карточка «ключ» при account.error 'empty' — «заказов не
   найдено» (kErrEmpty, правка человека 24.09). Версия расширения и язык
   браузера уходят в правила вместе с данными (VERSION, uiLang). ШАГ 3
   (решение человека 24.09): домен ссылок — из поля site файла (кеш remote),
   одинаково для всех локалей: словарь urlMy хранит путь, адрес собирает
   siteUrl из links.js; хост ставится setSiteHost при старте из readAll и по
   подписке на remote; без файла или при чужом site — proxys.io. */
import { msg, msgN, uiLang } from '../shared/i18n.js';
import { siteUrl, setSiteHost } from '../shared/links.js';   /* 7И: хост ссылок — из файла сообщений */
import { $, $$, esc } from '../shared/dom.js';
import { toast } from '../shared/toast.js';
import { quietGlass } from '../shared/quiet-glass.js';   /* 2.5.1: без blur во время прокрутки */
import { ICON_CLOSE, ICON_ARROW, ICON_CLOCK, ICON_WARN, ICON_GEAR, iconSun, iconMoon } from '../shared/icons.js';
import { expDays, expLabel, isExpired, tagStyle, flag, hasGeo, proxyHay, geoPlace, EXP_WARN_DAYS, EXP_BAD_DAYS } from '../shared/format.js';   /* 2.6.1: geoPlace — «Germany, Frankfurt am Main» в строке «Выход» */
import * as state from '../shared/state.js';
import * as storage from '../shared/storage.js';
import * as notifRules from '../shared/notifs.js';   /* 7Г: правила уведомлений — одни на попап и фон */
import { parseProxyLines, tabHost, siteOf, listsFrom, listField, normalizeDomains, coverage, isSystemDirect, isIPHost, normalizeOne } from '../shared/parse.js';
import { PROXY_TYPES, typeLabel, normType } from '../shared/proxytype.js';   /* 2.1: тип в строке списка и в разборе вставки */   /* 7Ж: списки и хост вкладки — одни с фоном; 7Л: listField — поле выбранного списка, normalizeDomains — исключения списка без правил */
import { SESSION_KEYS, LIST_MODES } from '../shared/constants.js';
import { SETTINGS } from '../shared/schema.js';   /* 7Ж: предел поля списка — из схемы, своей константы нет */

quietGlass();   /* 2.5.1: прокрутка без размытия фона */
/* ── данные: с этапа 4 — из хранилища, через state.js ──
   src — откуда прокси попал в список, и это не бухгалтерия:
   от него зависит, что мы вообще про прокси знаем.
     'pxs'    — загружен из proxys.io (ключ API, личный кабинет):
                вместе с адресом приходят страна и срок аренды;
     'manual' — вбит руками: кроме адреса и кредов, ничего нет.
   Страну по IP не гадаем — показали бы догадку под видом факта.
   gone — прокси пришёл по ключу, но из аккаунта пропал: аренда
   не продлена, заказ удалён. Из списка не выкидываем (поле ставит
   загрузка по ключу, этап 6).
   Здесь лежат КОПИИ трёх ключей хранилища. Меняются они только через
   функции записи state.js; правка копии до записи никуда не попадёт.
   3Б.2: наборы стенда и демо-набор из двадцати двух прокси сняты на
   этапе 4 — их листал только стенд и глаз при переносе. */
let proxies = [];
let settings = { ...state.DEFAULT_SETTINGS };
let st = { ...state.DEFAULT_STATE };
/* с девяти записей меню разворачивается в панель на всё окно
   и получает поиск: под селектором столько строк не помещается */
const MANY = 8;
let activeProxyId = '';   /* 3Б.2: имя из таблицы 3.12 мастер-промта; прежнее имя прототипа — запрещённый синоним.
                             Этап 4: зеркало st.activeProxyId — строка, пусто — '' (не null); пишется через applyState() */
function applyState(next){ st = next; activeProxyId = st.activeProxyId; }

/* ── ЗАКРЫТИЕ УВЕДОМЛЕНИЙ ПО ОДНОМУ ─────────────────────────
   Раньше здесь был общий флаг: при закрытии список уведомлений
   возвращался пустым, и «Закрыть всё» гасило вообще всё —
   включая предупреждения о том, что прокси вот-вот истечёт.
   Теперь у каждого уведомления свой идентификатор (nid), а закрытые
   помечены: nid → отметка времени закрытия. У сроков (с 7З —
   карточки-таблицы kind 'badAll' и 'warnAll'; правило snoozes в
   notifs.js) закрытие временное: убирать их насовсем нельзя — прокси
   от этого не продлится, — поэтому через SNOOZE (сутки) они
   возвращаются. Остальные закрываются навсегда; баннер со sticky не
   закрывается вовсе — крестика у него нет (правило closable там же).
   7Г: метки живут в ключе хранилища notifs (dismissed — закрытые,
   seen — прочитанные: панель открывали, число погасло, карточка
   осталась), пишутся через state.setNotifs и переживают закрытие
   попапа; здесь — копия ключа, как у остальных. Сами карточки, пороги
   SNOOZE и правило «что закрывается на сутки» — в notifs.js, одни с
   фоном. Кеш аккаунта (этап 6) читается ради карточек «новых»,
   «заменён» и «ключ не действует» — их считает notifs.js из него и
   списка; своего счётчика новых в попапе больше нет */
let notifs = { ...state.DEFAULT_NOTIFS };
let account = null;
/* 7И: кеш файла сообщений (ключ remote; null — забора ещё не было) — баннеры
   панели считает из него notifs.js; версия расширения — для фильтра по
   minVersion/maxVersion там же (та же, что у фона: из манифеста) */
let remote = null;
const VERSION = chrome.runtime.getManifest().version;
/* ПРАВИЛО ДЛЯ РАЗРАБОТКИ (списки доменов):
   группа «иконка + тип + свитчер» показывается, пока в списках
   есть хотя бы один домен — независимо от того, включены они
   или выключены. Пропадает группа только когда человек удалил
   все домены (списки пусты). Тип (чёрный/белый) сохраняется
   и в выключенном состоянии.
   Этап 4: три переменные списков сняты — всё это поля списков в settings
   из хранилища (см. renderSetrow). 7Л: самой группы больше нет — на её
   месте селектор режима, он виден всегда. */
/* Питание (этап 4): «включено» — это st.enabled из хранилища, «занято» —
   busy в памяти окна на время ответа фона; своей переменной power нет,
   чтобы окно не могло разойтись с браузером. off | busy | on.
   4.2: reconn — удержание картинки расстыковки при смене прокси на лету
   (см. reconnect()); пока оно идёт, питание показывается как «занято» */
let busy = false;
let reconn = false, reconnT = null, reconnMsg = null;   /* 4.2: удержание расстыковки и отложенный тост */
/* 7В: проверка при подключении идёт — фон держит state.probing; окно
   показывает то же «занято» и ту же подпись «Подключение», что при ответе
   фона (решение человека 11.09: отдельного слова у проверки нет). Кнопка
   питания при этом остаётся живой: выключить можно всегда */
const probing = () => st.enabled && st.probing === true && !st.lastError;   /* ошибка пришла раньше конца проверки — «Сбой», не «Проверяем…» */
const power = () => (busy || reconn || probing()) ? 'busy' : st.enabled ? 'on' : 'off';   /* 4.2: reconn; 7В: probing */
let heroErr = null, heroErrT; /* 'dead' | 'auth' | 'exp' и коды ответа фона — только память окна */
let connGen = 0;
/* причина ошибки для показа: срыв включения из памяти окна либо
   state.lastError из хранилища, пока прокси включён ('auth' ставит
   обработчик авторизации фона; 'dead' — фон по обрыву на трафике (7Б)
   и по проверке при подключении (7В)) */
const heroError = () => heroErr || (st.enabled && st.lastError) || null;

/* 3Б.6: $, $$ и esc — из dom.js, одни на оба окна */
const pop = $('#pop');
const active = () => proxies.find(p => p.id === activeProxyId) || null;

/* ── сообщения фону (этап 4) ──
   Контракт: { cmd:'enable', id } | { cmd:'switch', id } | { cmd:'disable' },
   ответ { ok:true } либо { ok:false, error }. Не ответил — 'noAnswer'. */
function send(cmd){
  return chrome.runtime.sendMessage(cmd)
    .then(r => (r && typeof r === 'object') ? r : { ok:false, error:'noAnswer' })
    .catch(() => ({ ok:false, error:'noAnswer' }));
}
/* перечитать состояние после ответа фона: enabled и activeProxyId к этому
   моменту он уже записал, подписка донесёт их чуть позже */
async function refreshState(){ applyState(await state.getState()); }
/* текст к коду ошибки: 'auth' и 'dead' — как в прототипе, 'exp' — срок,
   два уровня управления — из proxy.js фона, остальное — общая ошибка */
/* 2.6: SOCKS-прокси с логином не подключится НИКОГДА: Chrome предлагает
   SOCKS-серверу только метод без авторизации (проверено стендовым сервером:
   браузер присылает один способ — 0x00). Показывать на такой отказ «нет
   ответа» — неправда: причина известна, и человек может её исправить, взяв
   у поставщика HTTP-прокси или адрес, открытый по IP. */
function socksAuth(p){
  const t = p ? normType(p.type) : '';
  return Boolean(p && p.login && (t === 'SOCKS5' || t === 'SOCKS4'));
}
function errText(kind){
  return kind === 'exp'  ? msg('failExp')
       : kind === 'auth' ? msg('wrongCreds')
       : kind === 'dead' ? (socksAuth(active()) ? msg('errSocksAuth') : msg('errDead'))
       : kind === 'controlled_by_other_extensions' ? msg('errOtherExt')
       : kind === 'not_controllable' ? msg('errNotControllable')
       : kind === 'noAnswer' ? msg('errNoAnswer')
       : msg('errEnable');
}
/* короткая форма state.lastError рядом со «Сбой» — тостом, при появлении
   ошибки и при открытии окна с висящей ошибкой (ключи errShort*, connErr
   ждали этапа 4) */
/* 7В (решение человека 11.09, В2-а): при включённом тумблере переключения
   фон сменит прокси за доли секунды после 'dead' — тост про обрыв ждёт
   FAILOVER_WAIT_MS: пришла смена — вместо него «Обрыв — переключились на
   …» (см. подписку), не пришла (замены не нашлось) — обычный «Ошибка
   подключения». deadT — память окна: пока он идёт, смена прокси читается
   как переключение фона, а не выбор в соседнем окне */
const FAILOVER_WAIT_MS = 2000;
let deadT = null;
function noteLastError(prevErr, atStart){
  if(!st.enabled || !st.lastError || st.lastError === prevErr) return;
  if(st.lastError === 'dead' && settings.failover && !atStart){   /* окно открыли на уже висящий обрыв — ждать нечего */
    clearTimeout(deadT);
    deadT = setTimeout(() => {
      deadT = null;
      if(st.enabled && st.lastError === 'dead') toast(msg('connErr') + msg('errShortDead'), true);
    }, FAILOVER_WAIT_MS);
    return;
  }
  toast(msg('connErr') + msg(st.lastError === 'auth' ? 'errShortAuth'
                                            : st.lastError === 'dead' && socksAuth(active()) ? 'errSocksAuth'
                                            : 'errShortDead'), true);
}
/* открыть страницу расширения на разделе (решение 08.09): признак раздела —
   во временную область хранилища, тема — параметром адреса, чтобы первый
   кадр вкладки был в нужной теме. Попап при этом закрывается сам */
async function openPage(section){
  try{ await storage.sessionSet(SESSION_KEYS.SECTION, section); }
  catch(err){ console.error('[pxs] не удалось записать признак раздела:', err); }
  /* решение 09.09: уже открытая вкладка страницы переиспользуется — попап
     только показывает её, а признак раздела она читает по подписке.
     4.1 (золотой тест 09.09): вкладку ищем среди СВОИХ контекстов —
     chrome.runtime.getContexts (Chrome 116+) отдаёт вкладки расширения
     с tabId и windowId без разрешения tabs. Прежний поиск через запрос
     списка вкладок по адресу снят: без разрешения tabs такой запрос не
     видел даже собственные страницы расширения (пустой массив при
     открытой странице), и каждый переход открывал новую вкладку; вместе
     с ним снята ветка «что-то нашлось, но адреса не видно» — её
     допущение было неверным. Адрес сравниваем по началу: у открытой
     страницы может быть ?theme=…, так что фильтр documentUrls (адрес
     целиком) не годится. Нет своей вкладки — новая, с параметром темы.
     В Chrome без getContexts (до 116) — openOptionsPage: он находит
     открытую страницу сам, но перезагружает её и тему не передаёт —
     запасной путь для старых браузеров, принят 09.09 */
  const url = chrome.runtime.getURL('src/options/options.html');
  const theme = document.documentElement.dataset.theme === 'light' ? '?theme=light' : '';
  let ctxs = null;   /* 4.1 */
  if(typeof chrome.runtime.getContexts === 'function'){
    try{ ctxs = await chrome.runtime.getContexts({ contextTypes: ['TAB'] }); }
    catch(err){ console.error('[pxs] не удалось получить список своих вкладок:', err); }
  }
  if(ctxs === null){ chrome.runtime.openOptionsPage(); return; }   /* 4.1: запасной путь, Chrome до 116 */
  const own = ctxs.find(c => typeof c.documentUrl === 'string' && c.documentUrl.startsWith(url));   /* 4.1 */
  if(own){
    try{
      await chrome.tabs.update(own.tabId, { active:true });   /* 4.1: tabId контекста */
      await chrome.windows.update(own.windowId, { focused:true });
      return;
    }catch(err){ console.error('[pxs] не удалось показать вкладку страницы:', err); }
  }
  chrome.tabs.create({ url: url + theme });
}
/* одинаковое ли содержимое — чтобы эхо собственной записи из хранилища
   не перерисовывало окно второй раз */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ════════ ЯЗЫК ИНТЕРФЕЙСА (I18N-DICT-START) ════════
   Все надписи окна живут парой ru/en; L — активный словарь.
   Стенд (.stage/.states/.stand-note) — леса разработки, не
   переводится и в расширение не переносится. Заметки прокси —
   данные пользователя, не переводятся.
   3Б.2: пара ru/en переехала в _locales/{en,ru,uk}/messages.json;
   словаря I18N и переменной L в коде больше нет — каждое L.ключ стало
   msg('ключ') из src/shared/i18n.js, девять функций-ключей —
   подстановками $1/$2 и формами _one/_few/_many/_other через msgN().
   Язык даёт браузер (uiLang), переключателя нет. Ключи, переименованные
   при сведении словарей (отчёт 3Б.1, таблица 4.1): pmNone → notFound,
   expiredT → errExp, alertAdd → add, gear → navSettings; вложенный
   errShort.* уплощён в errShortExp/errShortAuth/errShortDead (errShortExp
   снят 7К.2 — потребителя не было). Пояснения,
   стоявшие здесь комментариями при ключах (errShort и connErr «ждут
   этапа 4, на проверке мёртвых ключей не выносить», подпись питания
   «называет состояние, а не действие», две подсказки страны вместо
   одной), перенесены в поле description этих ключей в messages.json. */

/* статичные узлы окна: перевод адресной раздачей по селекторам */
function applyStatic(){
  /* 3Б.6: строка прототипа, ставившая lang, снята — то же значение ставит
     theme.js до разбора разметки, второй раз оно ничего не меняло */
  $('#btnNotif').title = msg('notifT');
  $('#btnNotif').setAttribute('aria-label', msg('notifT'));
  const bt = $('#btnTheme');
  bt.title = document.documentElement.dataset.theme === 'light' ? msg('themeToDark') : msg('themeToLight');
  bt.setAttribute('aria-label', msg('themeToggle'));
  /* 3Б.2: три строки про #btnLang и #langMenu сняты вместе с глобусом */
  $('#pMenu').setAttribute('aria-label', msg('proxyList'));
  $('#btnGear').title = msg('gearT');
  $('#btnChkIp').title = msg('chkIpTip');
  $('#btnChkIp').setAttribute('aria-label', msg('chkIpTip'));
  $('#ckBtnT').textContent = msg('chkIpBtn');
  /* 2.6.1: строка «Выход» — подпись, кнопка перезагрузки и её подсказка */
  $('#exReload').textContent = msg('exitReload');
  $('#exReload').title = msg('exitReloadTip');
  $('#exLbl').textContent = msg('exitLbl');
  $('#lstSeg').setAttribute('aria-label', msg('luModeAria'));   /* 7Л: подписи кнопок — renderSetrow */
  $('#nBackT').textContent = msg('back');
  /* 7Ж: строка сайта и панель. Подпись «Прокси для:» — текстовый узел перед
     плашкой счёта #stLoad, поэтому firstChild, а не textContent (иначе счёт
     стёрся бы) */
  $('#stLbl').firstChild.nodeValue = msg('siteFor') + ' ';
  $('#stAddr').title = msg('scopeTip');
  $('#stSw').setAttribute('aria-label', msg('siteAria'));
  $('#spBackT').textContent = msg('back');
  $('#spTitle').textContent = msg('panelTitle');
  $('#spAllT').textContent = msg('allLists');
  /* 7Л (шаг 2): плашка выбора списка (п. 3) и подпись строки «Списки» (правки
     человека 20.09: подпись с иконкой в строке селектора, «Отмена» — крестик) */
  $('#lsLblT').textContent = msg('listsLbl');
  $('#lsLbl').title = msg('listsOpen');   /* правка 20.09 (7): подпись — кнопка в раздел списков страницы */
  $('#pick').setAttribute('aria-label', msg('pickListsT'));
  $('#pickT').textContent = msg('pickListsT');
  $('#pick [data-pick="black"]').textContent = msg('pickBlack');
  $('#pick [data-pick="white"]').textContent = msg('pickWhite');
  $('#pickCancel').title = msg('cancel');
  $('#pickCancel').setAttribute('aria-label', msg('cancel'));
  $('#nClear').title = msg('nClearT');
  $('#nClearT').textContent = msg('closeAll');
  /* 7Л: плашки «Нет добавленных доменов» больше нет — снята вместе с моделью списков */
}
/* ════════ (I18N-DICT-END) ════════ */


/* ── помощники: перенос из v187 ──
   3Б.2: toast, plural, expDays, expLabel, expShort, isExpired, константы
   CLK/TRI/ARR/GEAR_S, flag() с четырьмя зашитыми флагами, палитры
   TAG_COLORS/TAG_COLORS_LIGHT и tagStyle() отсюда ушли в src/shared/
   (toast.js, format.js, icons.js) и импортируются сверху: в прототипах
   они совпадали, а flag() в общем слое — версия страницы, 52 страны
   (красный Нидерландов #C04040 вместо #B03A3F). Русскую plural()
   заменил Intl.PluralRules внутри msgN(). expShort попап не вызывает —
   не импортирован. Здесь остаётся только то, чего у страницы нет. */
/* этап 4: константа галочки CHK, объявленная прототипом без потребителя,
   снята вместе с демо-данными (строка НЕ-НАХОДКИ v1.6) */

const BELL_ON  = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 13.3c-.9-1-1.4-2.4-1.4-3.8V8a4.2 4.2 0 0 0-8.4 0v1.5c0 1.4-.5 2.8-1.4 3.8l-.7.8h12.6z"/><path d="M8.4 16.2a1.7 1.7 0 0 0 3.2 0"/></svg>';
const BELL_OFF = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.2 9.5V8a4.2 4.2 0 0 0-6.9-3.2M5.9 5.9c-.05.2-.1.5-.1.7v2.9c0 1.4-.5 2.8-1.4 3.8l-.7.8h11"/><path d="M8.4 16.2a1.7 1.7 0 0 0 3.2 0"/><path d="m3.2 3.2 13.6 13.6"/></svg>';
/* ── селектор прокси ── */

function expIco(p){
  if(!p.exp) return '';
  const d = expDays(p);
  if(d < 0)  return `<span class="x-ico bad" title="${msg('errExp')}">${ICON_WARN}</span>`;
  if(d > EXP_WARN_DAYS)  return '';
  return `<span class="x-ico${d <= EXP_BAD_DAYS ? ' bad' : ' warn'}" title="${expLabel(d)}">${ICON_CLOCK}</span>`;
}
const PLUS = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>';
/* 3Б.6: hasGeo — из format.js, одна на оба окна; там же пояснение, откуда
   берётся страна (комментарий прототипа про «выход, определивший страну»
   расходился с разделом 3.9 мастер-промта и не перенесён) */
/* метка страны. В селекторе это span: .psel — настоящая кнопка,
   вложенная кнопка её бы разорвала при разборе. В строке списка
   (обычный div) — button: так метка берёт фокус с клавиатуры.
   Попап живёт только на десктопе, тач можно не закладывать.
   Страны нет — слот остаётся пустым, но своей ширины не теряет:
   строки с флагом и без него собираются по одной сетке. */
function geoMark(p, asBtn){
  if(hasGeo(p)) return flag(p.cc);
  const a = `class="geo-q" data-tip="${esc(p.src === 'pxs' ? msg('geoTipPxs') : msg('geoTipManPop'))}"`;
  return asBtn
    ? `<button type="button" ${a} aria-label="${esc(msg('geoUnk'))}"></button>`
    : `<span ${a} role="img" aria-label="${esc(msg('geoUnk'))}"></span>`;
}
/* пропал из аккаунта: тихая пометка перед сроком. Цветом не
   поднимаем — это факт, а не тревога */
function naccMark(p){
  return p.gone
    ? `<span class="pm-na" data-tip="${esc(msg('naccTip'))}" tabindex="0">${msg('naccT')}</span>`
    : '';
}

/* ── подсказка: один пузырь на окно ──
   Окно (.pop) и список прокси (.pm-sc) режут содержимое по своим
   краям, поэтому подсказку нельзя рисовать псевдоэлементом у
   самой метки — обрежется. Пузырь один, лежит прямо в окне и
   подставляется под метку: считает свободное место, уходит вверх
   или вниз, прижимается к полю окна, остриё держит на метке. */
const tip = $('#tip');
let tipFor = null, tipT;
function showTip(el){
  const txt = el.dataset.tip;
  if(!txt || el === tipFor) return;
  clearTimeout(tipT);
  tipFor = el;
  tip.textContent = txt;
  tip.hidden = false;
  tip.style.left = '0px';            /* мерим на свободном месте */
  tip.style.width = '';
  /* 7Л (правка человека 20.09, 1): пузырь не шире самой длинной строки — при
     переносе блок растягивался до max-width, и справа оставалась пустота.
     Строки меряем прямоугольниками диапазона; одна строка — как есть */
  const rg = document.createRange(); rg.selectNodeContents(tip);
  const lines = typeof rg.getClientRects === 'function' ? [...rg.getClientRects()] : [];
  if(lines.length > 1){
    const cs = getComputedStyle(tip);
    const inner = Math.max(...lines.map(r => r.right)) - Math.min(...lines.map(r => r.left));
    tip.style.width = Math.ceil(inner + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) + 1) + 'px';
  }
  const PAD = 8, GAP = 9;
  const pr = pop.getBoundingClientRect(), er = el.getBoundingClientRect();
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  const cx = er.left + er.width / 2 - pr.left;
  const left = Math.min(Math.max(cx - 26, PAD), Math.max(PAD, pr.width - tw - PAD));
  const up = er.top - pr.top - th - GAP >= PAD;
  tip.style.left = left + 'px';
  tip.style.top  = (up ? er.top - pr.top - th - GAP : er.bottom - pr.top + GAP) + 'px';
  tip.dataset.side = up ? 'top' : 'bottom';
  tip.style.setProperty('--ax', Math.min(Math.max(cx - left, 14), tw - 14) + 'px');
  requestAnimationFrame(() => tip.classList.add('on'));
}
function hideTip(){
  if(!tipFor) return;
  tipFor = null;
  tip.classList.remove('on');
  clearTimeout(tipT);
  tipT = setTimeout(() => { if(!tipFor) tip.hidden = true; }, 200);
}
/* пузырь общий на окно, поэтому и ловим его по общему признаку:
   любой элемент с data-tip, а не только метка страны */
pop.addEventListener('pointerover', e => {
  const q = e.target.closest('[data-tip]');
  if(q) showTip(q); else if(tipFor) hideTip();
});
pop.addEventListener('pointerleave', hideTip);
pop.addEventListener('focusin',  e => { const q = e.target.closest('[data-tip]'); if(q) showTip(q); });
pop.addEventListener('focusout', e => { if(e.target.closest('[data-tip]')) hideTip(); });
/* список прокси прокручивается — метка уезжает, пузырь остаётся:
   ловим скролл на всплытии сверху, у .pm-sc он не всплывает */
pop.addEventListener('scroll', hideTip, true);
function tagsInline(p){
  if(!p.tags || !p.tags.length) return '';
  const full = p.tags.map(x => '#' + x).join(', ');
  return `<span class="tgs" title="${esc(full)}">${p.tags.map(tg =>
    `<span class="chip tagc" style="${tagStyle(tg)}">#${esc(tg)}</span>`).join('')}</span>`;
}
function renderSel(){
  hideTip();                 /* метка перерисовывается — пузырь осиротеет */
  const p = active();
  const sel = $('#pSel');
  if(!proxies.length){
    sel.classList.add('add');
    sel.title = msg('addProxy');
    $('#selFlag').innerHTML = PLUS;
    $('#selIp').textContent = msg('addProxy');
    $('#selType').textContent = ''; $('#selType').hidden = true;
    $('#selTags').innerHTML = '';
    $('#selExp').innerHTML = '';
    return;
  }
  sel.classList.remove('add');
  sel.title = msg('selProxy');
  $('#selFlag').innerHTML = p ? geoMark(p, false) : '';
  $('#selIp').textContent = p ? p.ip : msg('noSel');
  /* 2.1: тип рядом с адресом; пусто, когда прокси не выбран */
  const selType = $('#selType');
  if(selType){
    selType.textContent = p ? typeLabel(p.type, p.typeGuess) : '';
    selType.dataset.pt = p ? normType(p.type) : '';
    selType.hidden = !p;
    selType.title = p ? msg(p.typeGuess ? 'typeGuessTip' : p.typeVerified ? 'typeVerifiedTip' : 'typeExactTip') : '';
  }
  $('#selTags').outerHTML = p ? (tagsInline(p) || '<span class="tgs"></span>') : '<span class="tgs"></span>';
  $('.psel .tgs').id = 'selTags';
  $('#selExp').innerHTML = p ? expIco(p) : '';
}
/* строка поиска в селекторе: 3Б.6 — proxyHay из format.js, одна на оба
   окна (пароль в неё не входит — пояснение там). Пометка «⚠️ 3Б.1»
   прототипа о названии страны закрыта на 3Б.2: ищется и код, и название. */
let pmQuery = '';
const BACK_I = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13.2 8H2.8"/><path d="m7 3.8-4.2 4.2L7 12.2"/></svg>';

function pmRowsHtml(){
  const q = pmQuery.trim().toLowerCase();
  let list = proxies, head = '';
  if(q){
    const hit = proxies.filter(p => proxyHay(p).includes(q));
    /* Активный показываем всегда, даже когда он не подходит под
       запрос: это единственная строка, которую нельзя
       «потерять» — по ней человек понимает, через что сейчас
       идёт трафик. Не совпавшего ставим первым, иначе он
       затеряется среди найденных.
       Отсюда же оговорка в «ничего не найдено»: без неё
       единственная оставшаяся строка читается как результат
       поиска, хотя она к запросу отношения не имеет. */
    const act = active();
    const keepAct = act && !hit.some(p => p.id === act.id);
    list = keepAct ? [act, ...hit] : hit;
    if(!hit.length) head = `<p class="pm-none">${keepAct ? msg('pmNoneAct') : msg('notFound')}</p>`;
  }
  if(!list.length && !head) return `<p class="pm-none">${msg('notFound')}</p>`;
  return head + list.map(p => `
    <div class="pm-row${p.id === activeProxyId ? ' on' : ''}" role="option" tabindex="0"
         aria-selected="${p.id === activeProxyId}" data-id="${p.id}">
      ${geoMark(p, true)}
      <span class="pm-ip">${esc(p.ip)}</span>
      <span class="pm-type" data-pt="${normType(p.type)}" title="${esc(msg(p.typeGuess ? 'typeGuessTip' : p.typeVerified ? 'typeVerifiedTip' : 'typeExactTip'))}">${esc(typeLabel(p.type, p.typeGuess))}</span>
      ${tagsInline(p)}
      <span class="pm-sp"></span>
      ${naccMark(p)}
      ${expIco(p)}
      <button class="pm-gear" data-goto="${p.id}" title="${msg('openInExt')}" aria-label="${msg('openThisExt')}">${ICON_GEAR}</button>
    </div>`).join('');
}

function renderMenu(){
  hideTip();
  const many = proxies.length > MANY;
  $('#pMenu').classList.toggle('full', many);
  pop.classList.toggle('menufull', many);
  /* длинный список разворачивается в панель на всё окно: под
     селектором шести строкам места нет (см. .pmenu.full) */
  $('#pMenu').innerHTML = many
    ? `<div class="pm-top">
         <button class="pm-back" data-pmclose title="${msg('pmClose')}" aria-label="${msg('pmClose')}">${BACK_I}</button>
         <input class="pm-q" id="pmQ" placeholder="${msg('pmSearch')}" aria-label="${msg('pmSearch')}" spellcheck="false" autocomplete="off" value="${esc(pmQuery)}">
         <button class="pm-plus" data-am="more" title="${msg('moreWays')}" aria-label="${msg('moreWays')}">${PLUS}</button>
       </div>
       <div class="pm-rows">${pmRowsHtml()}</div>`
    : `<div class="pm-sc">${pmRowsHtml()}
       <div class="am-tail">
         <div class="am-cap">${msg('quickAdd')}</div>
         <textarea class="am-ta" id="amTa" rows="2" spellcheck="false"
           placeholder="${msg('pastePh')}" aria-label="${msg('pastePh')}"></textarea>
         <p class="am-prev" id="amPrev" hidden></p>
         <button class="am-add" data-amadd>${msg('addProxy')}</button>
         <p class="am-note">${msg('amTypes')}</p>
         <button class="am-more" data-am="more">${msg('moreWays')}${ICON_ARROW}</button>
       </div></div>`;
}
function openMenu(open){
  hideTip();
  $('#pMenu').hidden = !open;
  $('#pSel').setAttribute('aria-expanded', String(open));
  if(!open){
    /* закрыли — запрос забываем: в следующий раз список должен
       открыться целиком, а не остатком прошлого поиска */
    pmQuery = '';
    $('#pMenu').classList.remove('full');
    pop.classList.remove('menufull');
    return;
  }
  if(proxies.length) renderMenu(); else renderAddMenu();
  /* высота выпадающего меню: от него до нижней грани окна минус
     отступ, равный боковому (14) и рамки меню; короткий список
     не растягивается — max-height, не height. Панель на всё
     окно считать не нужно: её растягивает flex. */
  if($('#pMenu').classList.contains('full')) return;
  const pr = pop.getBoundingClientRect();
  const sr = $('#pSel').getBoundingClientRect();
  const avail = Math.max(96, pr.bottom - 14 - sr.bottom - 6 - 2);
  if($('.pm-sc')) $('.pm-sc').style.maxHeight = avail + 'px';
}
$('#pSel').addEventListener('click', () => openMenu($('#pMenu').hidden));
document.addEventListener('pointerdown', e => {
  if(!$('#pMenu').hidden && !e.target.closest('.psw')) openMenu(false);
});
/* 7З (решение человека 22.09): под полем «Быстрого добавления» в обеих
   отрисовках (хвост списка выше и пустой список здесь) — кнопка «Добавить
   прокси» (.am-add): люди не понимали, что надо нажать Enter.
   Клик идёт тем же путём, что Enter, — quickAdd; ключ addProxy уже есть */
function renderAddMenu(){
  $('#pMenu').innerHTML = `<div class="pm-sc am">
    <div class="am-cap">${msg('quickAdd')}</div>
    <textarea class="am-ta" id="amTa" rows="3" spellcheck="false"
      placeholder="${msg('pastePh')}" aria-label="${msg('pastePh')}"></textarea>
    <p class="am-prev" id="amPrev" hidden></p>
    <button class="am-add" data-amadd>${msg('addProxy')}</button>
    <p class="am-note">${msg('amTypes')}</p>
    <button class="am-more" data-am="more">${msg('moreWays')}${ICON_ARROW}</button>
  </div>`;
}
async function quickAdd(txt){
  /* этап 4: разбор — parse.js общего слоя, те же форматы, что на странице;
     деление строки по разделителям с портом 8080 «по умолчанию» снято.
     Вставили руками: ни страны, ни срока аренды у нас нет — полей cc и
     exp у записи нет вовсе (форма схемы PROXY) */
  const { found, skipped } = parseProxyLines(txt);
  if(!found.length && !skipped.length) return;
  if(!found.length){ toast(msg('noneFound'), true); return; }
  const list = [...proxies, ...found.map(p => ({ id: state.newProxyId(), ...p }))];
  const first = list[proxies.length].id;
  try{
    await state.setProxies(list);
    /* нечего было включать — выбираем первого добавленного; пока прокси
       включён, выбор пишет только фон */
    if(!active() && !st.enabled) await state.patchState({ activeProxyId: first });
  }catch(err){
    console.error('[pxs] не удалось записать прокси:', err);
    toast(msg('errStorage'), true);
    return;
  }
  proxies = list;
  if(!active() && !st.enabled) applyState({ ...st, activeProxyId: first });
  openMenu(false);
  renderSel(); renderPower(); renderBadge();
  toast(skipped.length
    ? msg('addedSkipped', [String(found.length), String(skipped.length)])
    : msgN('addedN', found.length));
}
/* при наборе перерисовываем только строки: перерисуй мы меню
   целиком, поле теряло бы фокус на каждой букве */
$('#pMenu').addEventListener('input', e => {
  /* 2.1: живой разбор быстрого добавления — типы видны ДО нажатия
     «Добавить», а не после, когда записи уже легли в список */
  if(e.target.id === 'amTa'){ amPreview(e.target.value); return; }
  if(e.target.id !== 'pmQ') return;
  pmQuery = e.target.value;
  const box = $('.pm-rows');
  if(box) box.innerHTML = pmRowsHtml();
});

/* 2.1: строка «что будет добавлено» под полем быстрого добавления.
   Несколько строк — счётчики по типам; одна — её тип со звёздочкой, если
   он угадан по порту (подсказка на чипе объясняет). */
function amPreview(txt){
  const box = $('#amPrev'); if(!box) return;
  const { found, skipped } = parseProxyLines(txt);
  if(!found.length){ box.hidden = true; box.innerHTML = ''; return; }
  const c = {};
  for(const p of found){ const t = normType(p.type); c[t] = (c[t] || 0) + 1; }
  const chips = PROXY_TYPES.filter(t => c[t]).map(t =>
    `<span class="am-tp" data-pt="${t}">${t}<b>${c[t]}</b></span>`).join('');
  const guess = found.length === 1 && found[0].typeGuess ? msg('amGuess') : '';
  const skip = skipped.length ? `<span class="am-skip">${msg('amSkipped', [String(skipped.length)])}</span>` : '';
  box.innerHTML = chips + guess + skip;
  box.hidden = false;
}

$('#pMenu').addEventListener('click', e => {
  if(e.target.closest('[data-pmclose]')){ openMenu(false); return; }
  if(e.target.closest('#pmQ')) return;
  /* 7З: кнопка «Добавить прокси» — тот же путь, что Enter в поле (тосты,
     выбор первого добавленного, закрытие меню); пустое поле — курсор в
     поле, без тоста. Ветка стоит ДО [data-am]: та ведёт на страницу */
  if(e.target.closest('[data-amadd]')){
    const ta = $('#amTa');
    if(!ta) return;
    if(!ta.value.trim()){ ta.focus(); return; }
    quickAdd(ta.value);
    return;
  }
  const am = e.target.closest('[data-am]');
  if(am){
    openPage({ go:'add' });   /* этап 4: страница, вкладка «Добавить» (был тост openWays) */
    openMenu(false);
    return;
  }
  if(e.target.closest('.am-ta')) return;
  /* метки страны и «нет в аккаунте» — только подсказки */
  if(e.target.closest('.geo-q') || e.target.closest('.pm-na')) return;
  const g = e.target.closest('.pm-gear');
  if(g){
    openPage({ go:'proxy', id: g.dataset.goto });   /* этап 4: строка этого прокси на странице (был тост openMy); id — строка, без приведения к числу */
    openMenu(false);
    return;
  }
  const r = e.target.closest('.pm-row');
  if(r) pickProxy(r.dataset.id);
});
$('#pMenu').addEventListener('keydown', e => {
  if(e.target.closest('.am-ta')){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); quickAdd(e.target.value); }
    return;
  }
  if(e.key !== 'Enter' && e.key !== ' ') return;
  if(e.target.closest('.geo-q') || e.target.closest('.pm-na')) return;
  const r = e.target.closest('.pm-row');
  if(r){ e.preventDefault(); pickProxy(r.dataset.id); }
});
function pickProxy(id){
  const was = activeProxyId;
  /* сразу, до записи: селектор не ждёт хранилища */
  applyState({ ...st, activeProxyId: id });
  openMenu(false);
  renderSel();
  if(id === was) return;
  const p = active();
  /* этап 4: прокси включён или включается — переключаем через фон;
     выключен — просто записываем выбор (пока прокси включён, activeProxyId
     пишет только фон, иначе логин и пароль разошлись бы с настройкой) */
  if(st.enabled || busy || reconn) reconnect(id, msg('connectedTo', [p.ip]));   /* 4.2: смена на лету — с расстыковкой (было connect) */
  else state.patchState({ activeProxyId: id }).catch(err => {
    console.error('[pxs] не удалось записать выбор:', err);
    toast(msg('errStorage'), true);
  });
}

/* ── подключение: механика v187 в сжатом виде ── */

/* ════════ СЦЕНА КОННЕКТОРА ════════
   Четыре комплекта отрисовки — база, согласование, подключено,
   ошибка. Комплект это панель плюс коннектор; между собой они
   согласованы по координатам, поэтому подмена ничего не сдвигает.

   ГЕОМЕТРИЯ вычислена из самих файлов, не подобрана на глаз:
   · пины коннектора  x 152.57…173.07, y 19.9 / 34.7 / 49.6
   · гнёзда панели    x 17.01,         y 70.5 / 85.3 / 100.2
   отсюда вертикаль панели −47.5 и сдвиг холста коннектора
   (25.25, 3): у отрисовки без маски холст 174×68, у маски 190×74.
   Активные панели вдобавок смещены внутри своего холста 287×287
   на (134.327, 58.713) — Фигма расширила его под ореол. Без
   компенсации панель уезжает за кадр, и коннектор втыкается в
   пустоту. Сходимость проверяется по гнёздам: у всех четырёх
   комплектов они обязаны сойтись в одну точку.

   ЛЕНИВАЯ ЗАГРУЗКА. В разметке лежит только базовый комплект.
   Окно попапа открывается заново на каждый клик по значку, и
   там дорога каждая миллисекунда до первой отрисовки: три
   неиспользованных комплекта в DOM — это лишние полторы тысячи
   узлов на старте. Остальные вставляются при первом переходе
   в своё состояние и дальше живут вместе с окном. */
const CQ_LAZY = {
  busy:`<svg class="cq-set cq-pn" data-k="busy" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g class="cq-pnw"><g transform="translate(-134.327 -58.713)"><circle cx="143.07" cy="143.07" r="143.07" fill="url(#paint0_radial_33_4118)" fill-opacity="0.5"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="#333333"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint1_linear_33_4118)"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint2_linear_33_4118)" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint3_linear_33_4118)"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="#1C1C1C" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint4_linear_33_4118)"/><path d="M161.98 218.51L161.93 218.3L162.05 218.2L161.98 218.51ZM158.22 216.76L158.18 216.63L158.2 216.52L158.22 216.76ZM215.86 206.26H164.78L162.86 208.4L162.62 213.92L162.6 213.9L162.86 207.97L164.78 205.83H215.86V206.26ZM162.01 206.81L162 207.22L161.65 206.26L161.75 206.12L162.01 206.81ZM186.3 182.32L178.68 192.93L175.36 194.15L167.01 203.71H166.64L175.36 193.72L178.68 192.5L186.23 181.99L186.3 182.32ZM185.18 180.59L185.49 181.89L185.37 181.79L185.18 181.02V180.59ZM215.65 107.23H187.09V107.45L185.96 108.34V107.91L187.09 107.02V106.81H215.65V107.23ZM158.78 79.81L160.76 83.02L183 107.02H185.18V107.45H183L160.76 83.45L158.78 80.24V79.81ZM215.75 85.78H168.02C167.88 85.63 167.74 85.49 167.61 85.35H215.75V85.78ZM215.85 65.94H163.41L162.83 66.91V66.48L163.41 65.51H215.85V65.94ZM215.89 59.85H161.4L161.36 59.27H215.89V59.85Z" fill="black"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="#535353"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="url(#paint5_linear_33_4118)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint6_linear_33_4118)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint7_linear_33_4118)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint8_radial_33_4118)"/><path d="M159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H160.72V221.86L157.73 216.67L158.25 205.95L179.32 180.83V108.81C179.32 107.4 178.79 106.05 177.85 105.01L159.26 84.57L154.91 77.56H147.25L147.4 77.37H155.57L159.93 84.38ZM145.54 79.08H143.1V78.89H145.69L145.54 79.08Z" fill="black"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="#343333"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="url(#paint9_linear_33_4118)"/><path d="M143.47 81.83L140.99 83.89H148.99L152.22 80.88H146.08C145.12 80.88 144.2 81.21 143.47 81.83Z" fill="#8F8F8F"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="#575757"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="url(#paint10_linear_33_4118)"/><path d="M145.64 85.97C146.38 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.26 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.8 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.31 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="#8E7878"/><path d="M145.64 85.97C146.38 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.26 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.8 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.31 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="url(#paint11_linear_33_4118)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.88 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="#2B2B2B"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.88 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint12_linear_33_4118)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L150.61 94.69C150.51 94.88 150.44 95.08 150.4 95.29L149.8 98.16C149.74 98.41 149.65 98.65 149.52 98.88L146.28 104.49C146.07 104.87 145.96 105.3 145.96 105.73L146.33 184.87C146.33 185.25 146.42 185.62 146.59 185.95L149.53 191.86C149.65 192.09 149.73 192.34 149.77 192.59L150.42 196.96L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.88 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint13_linear_33_4118)"/><g filter="url(#filter0_d_33_4118)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.42 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.82 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.79 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="#151515"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.42 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.82 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.79 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_33_4118)"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.42 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.82 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.79 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" stroke="#B8661F" stroke-width="0.3"/></g><path d="M151 122.43C151 120.73 152.32 119.31 154.02 119.18L155.14 119.09C156.56 118.98 157.78 120.11 157.78 121.53V166.18C157.78 167.85 156.2 169.07 154.58 168.66L153.46 168.38C152.02 168.01 151 166.7 151 165.21V122.43Z" fill="#0B0B0B"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint15_linear_33_4118)"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint16_linear_33_4118)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint17_linear_33_4118)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint18_linear_33_4118)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint19_linear_33_4118)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint20_linear_33_4118)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint21_linear_33_4118)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint22_linear_33_4118)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint23_linear_33_4118)"/><ellipse opacity="0.8" cx="152.22" cy="143.25" rx="10.36" ry="16.04" fill="url(#paint24_radial_33_4118)"/><ellipse opacity="0.8" cx="152.22" cy="128.03" rx="10.36" ry="16.04" fill="url(#paint25_radial_33_4118)"/><ellipse opacity="0.8" cx="152.22" cy="157.85" rx="10.36" ry="16.04" fill="url(#paint26_radial_33_4118)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint27_linear_33_4118)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint28_radial_33_4118)"/><path d="M151.65 152.41C153.34 152.41 154.71 155.3 154.71 158.87C154.71 162.44 153.34 165.34 151.65 165.34C151.6 165.34 151.55 165.33 151.5 165.33C153.11 165.16 154.4 162.34 154.4 158.87C154.4 155.41 153.11 152.59 151.5 152.42C151.55 152.41 151.6 152.41 151.65 152.41Z" fill="black"/><path d="M151.65 137.56C153.34 137.56 154.71 140.46 154.71 144.03C154.71 147.6 153.34 150.49 151.65 150.49C151.6 150.49 151.55 150.49 151.5 150.48C153.11 150.32 154.4 147.49 154.4 144.03C154.4 140.57 153.11 137.74 151.5 137.57C151.55 137.57 151.6 137.56 151.65 137.56Z" fill="black"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint29_linear_33_4118)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint30_radial_33_4118)"/><ellipse cx="150.51" cy="129.18" rx="2.24" ry="4.73" fill="#464646"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint31_linear_33_4118)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint32_radial_33_4118)"/><ellipse cx="150.77" cy="129.18" rx="2.5" ry="5.32" fill="url(#paint33_linear_33_4118)"/><ellipse cx="150.77" cy="143.93" rx="2.5" ry="5.32" fill="url(#paint34_linear_33_4118)"/><ellipse cx="150.77" cy="158.87" rx="2.5" ry="5.32" fill="url(#paint35_linear_33_4118)"/><path d="M151.65 122.72C153.34 122.72 154.71 125.61 154.71 129.18C154.71 132.75 153.34 135.65 151.65 135.65C151.6 135.65 151.55 135.64 151.5 135.64C153.11 135.47 154.4 132.65 154.4 129.18C154.4 125.72 153.11 122.89 151.5 122.73C151.55 122.72 151.6 122.72 151.65 122.72Z" fill="black"/><g class="cq-glow" filter="url(#filter0_d_33_4118)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.42 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.82 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.79 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_33_4118)"/></g></g></g></svg><svg class="cq-set cq-cnv" data-k="busy" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g mask="url(#cqCut)"><g class="cq-cn"><g class="cq-shift"><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="#464646"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint0_linear_33_3754)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint1_linear_33_3754)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint2_linear_33_3754)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="black"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint3_radial_33_3754)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint4_linear_33_3754)" fill-opacity="0.1"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="#464646"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint5_linear_33_3754)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint6_linear_33_3754)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint7_linear_33_3754)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="black"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint8_radial_33_3754)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint9_linear_33_3754)" fill-opacity="0.1"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="#464646"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint10_linear_33_3754)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint11_linear_33_3754)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint12_linear_33_3754)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="black"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint13_radial_33_3754)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint14_linear_33_3754)" fill-opacity="0.1"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint15_linear_33_3754)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint16_linear_33_3754)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint17_radial_33_3754)"/><path d="M79.1 0.92C79.5 1.23 79.81 1.66 79.96 2.18L81.26 6.68C81.58 7.79 81.75 8.94 81.75 10.09V57.21C81.75 58.36 81.58 59.5 81.27 60.6L79.96 65.15C79.83 65.57 79.6 65.94 79.3 66.23C77.04 65.9 75.18 64.21 74.66 61.93L73.28 55.75C73.31 55.37 73.33 55 73.33 54.62V12.68C73.33 12.24 73.31 11.79 73.26 11.35L74.88 4.27C75.32 2.31 77.07 0.92 79.08 0.92H79.1Z" fill="url(#paint18_linear_33_3754)"/><path d="M149.02 0.52C150.14 0.52 151.12 1.28 151.39 2.37L152.56 6.98C152.81 7.96 152.93 8.97 152.93 9.98V57.52C152.93 58.53 152.81 59.54 152.56 60.52L151.39 65.17C151.12 66.26 150.14 67.02 149.01 67.02H80.24C79.28 67.02 77.34 65.95 75.73 64.35C77.01 65.24 78 65.41 78.73 65.26C80.34 64.95 80.7 62.94 80.97 61.33C81.38 58.94 81.58 56.53 81.58 54.11V9.98C81.58 8.97 81.45 7.96 81.2 6.98L80.18 2.92C79.99 2.18 78.24 0.7 76.56 1.58C77.64 0.4 79.92 0.52 80.64 0.52H149.02Z" fill="url(#paint19_linear_33_3754)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint20_linear_33_3754)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint21_linear_33_3754)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint22_radial_33_3754)" fill-opacity="0.4"/><path d="M74.88 13.69C74.88 12.61 75.75 11.74 76.82 11.74H77.5C77.99 11.74 78.42 12.08 78.54 12.55C79.28 15.48 79.66 18.48 79.66 21.5V45.61C79.66 48.64 79.28 51.65 78.54 54.59C78.42 55.07 77.99 55.41 77.49 55.41H76.82C75.75 55.41 74.88 54.54 74.88 53.46V13.69Z" fill="black"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.16 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.51 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="#2D2D2D"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.16 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.51 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="url(#paint23_linear_33_3754)"/><path d="M66.12 10.88C67.24 10.88 68.22 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.22 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L53 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.24 11.15 52.84 10.88 53.5 10.88H66.12Z" fill="#727272"/><path d="M66.12 10.88C67.24 10.88 68.22 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.22 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L53 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.24 11.15 52.84 10.88 53.5 10.88H66.12Z" fill="url(#paint24_linear_33_3754)"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="#262626"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="url(#paint25_linear_33_3754)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H150.51C151.63 67.54 152.61 66.78 152.88 65.69L154.46 59.44L155.56 49.15V17.6L154.46 8.07L152.88 1.85C152.61 0.76 151.63 0 150.51 0H150.96Z" fill="#161616"/><mask id="mask0_33_3754" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="26" width="54" height="15"><rect x="0" y="26.37" width="53.41" height="14.43" fill="url(#paint26_linear_33_3754)"/></mask><g mask="url(#mask0_33_3754)"><path d="M47.03 30.01C47.03 28.75 48.05 27.73 49.31 27.73H50.26C50.3 27.73 50.34 27.75 50.36 27.78C51.14 28.65 51.58 29.78 51.58 30.94V36.2C51.58 37.38 51.14 38.51 50.36 39.38C50.34 39.41 50.3 39.43 50.26 39.43H49.3C48.05 39.43 47.03 38.41 47.03 37.16V30.01Z" fill="black"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.75C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.75 27.41H48.86Z" fill="#262626"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.75C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.75 27.41H48.86Z" fill="url(#paint27_linear_33_3754)"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="black" fill-opacity="0.8"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="#262626" fill-opacity="0.2"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="url(#paint28_radial_33_3754)"/></g><path d="M50.42 27.3C50.42 26.99 50.66 26.74 50.97 26.74H51.13C51.3 26.74 51.44 26.86 51.48 27.02C51.69 27.92 51.79 28.84 51.79 29.77V37.38C51.79 38.31 51.69 39.23 51.48 40.14C51.44 40.3 51.29 40.42 51.13 40.42H50.97C50.66 40.42 50.42 40.17 50.42 39.86V27.3Z" fill="black"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.38 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.76 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="#727272"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.38 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.76 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="url(#paint29_linear_33_3754)"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.18 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.17 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="#262626"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.18 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.17 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="url(#paint30_linear_33_3754)"/><rect x="46.32" y="28.05" width="3.03" height="11.46" rx="1.44" fill="black"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="url(#paint31_radial_33_3754)"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="black" fill-opacity="0.2"/><ellipse opacity="0.8" cx="48.15" cy="33.58" rx="4.79" ry="10.25" fill="url(#paint32_radial_33_3754)"/></g></g></g></svg>`,
  on:`<svg class="cq-set cq-pn" data-k="on" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g class="cq-pnw"><g transform="translate(-134.327 -58.713)"><circle cx="143.07" cy="143.07" r="143.07" fill="url(#paint0_radial_28_1854)" fill-opacity="0.5"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="#333333"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint1_linear_28_1854)"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint2_linear_28_1854)" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint3_linear_28_1854)"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="#1C1C1C" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint4_linear_28_1854)"/><path d="M161.98 218.51L161.93 218.3L162.05 218.2L161.98 218.51ZM158.22 216.76L158.18 216.63L158.2 216.52L158.22 216.76ZM215.86 206.26H164.79L162.86 208.4L162.62 213.92L162.6 213.9L162.86 207.97L164.79 205.83H215.86V206.26ZM162.01 206.81L162 207.22L161.65 206.26L161.75 206.12L162.01 206.81ZM186.3 182.32L178.68 192.93L175.36 194.15L167.01 203.71H166.64L175.36 193.72L178.68 192.5L186.23 181.99L186.3 182.32ZM185.18 180.59L185.49 181.89L185.37 181.79L185.18 181.02V180.59ZM215.65 107.23H187.09V107.45L185.96 108.34V107.91L187.09 107.02V106.81H215.65V107.23ZM158.78 79.81L160.76 83.02L183 107.02H185.18V107.45H183L160.76 83.45L158.78 80.24V79.81ZM215.75 85.78H168.02C167.88 85.63 167.74 85.49 167.61 85.35H215.75V85.78ZM215.85 65.94H163.41L162.83 66.91V66.48L163.41 65.51H215.85V65.94ZM215.89 59.85H161.4L161.36 59.27H215.89V59.85Z" fill="black"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="#535353"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="url(#paint5_linear_28_1854)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint6_linear_28_1854)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint7_linear_28_1854)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint8_radial_28_1854)"/><path d="M159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H160.72V221.86L157.73 216.67L158.26 205.95L179.32 180.83V108.81C179.32 107.4 178.79 106.05 177.85 105.01L159.26 84.57L154.91 77.56H147.25L147.4 77.37H155.57L159.93 84.38ZM145.54 79.08H143.1V78.89H145.69L145.54 79.08Z" fill="black"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="#343333"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="url(#paint9_linear_28_1854)"/><path d="M143.47 81.83L140.99 83.89H148.99L152.22 80.88H146.08C145.12 80.88 144.2 81.21 143.47 81.83Z" fill="#8F8F8F"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="#575757"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="url(#paint10_linear_28_1854)"/><path d="M145.64 85.97C146.39 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.27 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.81 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.32 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="#8E7878"/><path d="M145.64 85.97C146.39 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.27 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.81 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.32 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="url(#paint11_linear_28_1854)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="#2B2B2B"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint12_linear_28_1854)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L150.61 94.69C150.51 94.88 150.44 95.08 150.4 95.29L149.8 98.16C149.74 98.41 149.65 98.65 149.52 98.88L146.28 104.49C146.07 104.87 145.96 105.3 145.96 105.73L146.33 184.87C146.33 185.25 146.42 185.62 146.59 185.95L149.54 191.86C149.65 192.09 149.73 192.34 149.77 192.59L150.42 196.96L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint13_linear_28_1854)"/><g filter="url(#filter0_d_28_1854)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="#151515"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_28_1854)"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" stroke="#7DD961" stroke-width="0.3"/></g><path d="M151 122.43C151 120.73 152.32 119.31 154.02 119.18L155.14 119.09C156.56 118.98 157.78 120.11 157.78 121.53V166.18C157.78 167.85 156.2 169.07 154.58 168.66L153.46 168.38C152.02 168.01 151 166.7 151 165.21V122.43Z" fill="#0B0B0B"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint15_linear_28_1854)"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint16_linear_28_1854)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint17_linear_28_1854)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint18_linear_28_1854)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint19_linear_28_1854)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint20_linear_28_1854)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint21_linear_28_1854)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint22_linear_28_1854)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint23_linear_28_1854)"/><ellipse opacity="0.8" cx="152.22" cy="143.25" rx="10.36" ry="16.04" fill="url(#paint24_radial_28_1854)"/><ellipse opacity="0.8" cx="152.22" cy="128.03" rx="10.36" ry="16.04" fill="url(#paint25_radial_28_1854)"/><ellipse opacity="0.8" cx="152.22" cy="157.85" rx="10.36" ry="16.04" fill="url(#paint26_radial_28_1854)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint27_linear_28_1854)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint28_radial_28_1854)"/><path d="M151.65 152.41C153.34 152.41 154.71 155.3 154.71 158.87C154.71 162.44 153.34 165.34 151.65 165.34C151.6 165.34 151.55 165.33 151.5 165.33C153.11 165.16 154.4 162.34 154.4 158.87C154.4 155.41 153.11 152.59 151.5 152.42C151.55 152.41 151.6 152.41 151.65 152.41Z" fill="black"/><path d="M151.65 137.56C153.34 137.56 154.71 140.46 154.71 144.03C154.71 147.6 153.34 150.49 151.65 150.49C151.6 150.49 151.55 150.49 151.5 150.48C153.11 150.32 154.4 147.49 154.4 144.03C154.4 140.57 153.11 137.74 151.5 137.57C151.55 137.57 151.6 137.56 151.65 137.56Z" fill="black"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint29_linear_28_1854)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint30_radial_28_1854)"/><ellipse cx="150.51" cy="129.18" rx="2.24" ry="4.73" fill="#464646"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint31_linear_28_1854)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint32_radial_28_1854)"/><ellipse cx="150.77" cy="129.18" rx="2.5" ry="5.32" fill="url(#paint33_linear_28_1854)"/><ellipse cx="150.77" cy="143.93" rx="2.5" ry="5.32" fill="url(#paint34_linear_28_1854)"/><ellipse cx="150.77" cy="158.87" rx="2.5" ry="5.32" fill="url(#paint35_linear_28_1854)"/><path d="M151.65 122.72C153.34 122.72 154.71 125.61 154.71 129.18C154.71 132.75 153.34 135.65 151.65 135.65C151.6 135.65 151.55 135.64 151.5 135.64C153.11 135.47 154.4 132.65 154.4 129.18C154.4 125.72 153.11 122.89 151.5 122.73C151.55 122.72 151.6 122.72 151.65 122.72Z" fill="black"/><g class="cq-glow" filter="url(#filter0_d_28_1854)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_28_1854)"/></g></g></g></svg><svg class="cq-set cq-cnv" data-k="on" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g mask="url(#cqCut)"><g class="cq-cn"><g class="cq-shift"><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="#464646"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint0_linear_30_2900)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint1_linear_30_2900)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint2_linear_30_2900)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="black"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint3_radial_30_2900)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint4_linear_30_2900)" fill-opacity="0.1"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="#464646"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint5_linear_30_2900)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint6_linear_30_2900)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint7_linear_30_2900)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="black"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint8_radial_30_2900)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint9_linear_30_2900)" fill-opacity="0.1"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="#464646"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint10_linear_30_2900)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint11_linear_30_2900)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint12_linear_30_2900)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="black"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint13_radial_30_2900)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint14_linear_30_2900)" fill-opacity="0.1"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint15_linear_30_2900)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint16_linear_30_2900)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.54 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint17_radial_30_2900)"/><path d="M79.1 0.92C79.5 1.23 79.81 1.66 79.96 2.18L81.26 6.68C81.58 7.79 81.75 8.94 81.75 10.09V57.21C81.75 58.36 81.58 59.5 81.27 60.6L79.96 65.15C79.83 65.57 79.6 65.94 79.3 66.23C77.04 65.9 75.18 64.21 74.66 61.93L73.28 55.75C73.31 55.37 73.33 55 73.33 54.62V12.68C73.33 12.24 73.31 11.79 73.26 11.35L74.88 4.27C75.32 2.31 77.07 0.92 79.08 0.92H79.1Z" fill="url(#paint18_linear_30_2900)"/><path d="M149.02 0.52C150.14 0.52 151.12 1.28 151.39 2.37L152.56 6.98C152.81 7.96 152.93 8.97 152.93 9.98V57.52C152.93 58.53 152.81 59.54 152.56 60.52L151.39 65.17C151.12 66.26 150.14 67.02 149.01 67.02H80.24C79.28 67.02 77.34 65.95 75.73 64.35C77.01 65.24 78 65.41 78.73 65.26C80.34 64.95 80.7 62.94 80.97 61.33C81.38 58.94 81.58 56.53 81.58 54.11V9.98C81.58 8.97 81.45 7.96 81.2 6.98L80.18 2.92C79.99 2.18 78.24 0.7 76.56 1.58C77.64 0.4 79.92 0.52 80.64 0.52H149.02Z" fill="url(#paint19_linear_30_2900)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint20_linear_30_2900)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint21_linear_30_2900)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.73 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint22_radial_30_2900)" fill-opacity="0.4"/><path d="M74.88 13.69C74.88 12.61 75.75 11.74 76.82 11.74H77.5C77.99 11.74 78.42 12.08 78.54 12.55C79.28 15.48 79.66 18.48 79.66 21.5V45.61C79.66 48.64 79.28 51.65 78.54 54.59C78.42 55.07 77.99 55.41 77.49 55.41H76.82C75.75 55.41 74.88 54.54 74.88 53.46V13.69Z" fill="black"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.16 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.51 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="#2D2D2D"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.16 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.51 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="url(#paint23_linear_30_2900)"/><path d="M66.12 10.88C67.24 10.88 68.22 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.22 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L53 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.24 11.15 52.84 10.88 53.5 10.88H66.12Z" fill="#727272"/><path d="M66.12 10.88C67.24 10.88 68.22 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.22 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L53 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.24 11.15 52.84 10.88 53.5 10.88H66.12Z" fill="url(#paint24_linear_30_2900)"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="#262626"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="url(#paint25_linear_30_2900)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H150.51C151.63 67.54 152.61 66.78 152.88 65.69L154.46 59.44L155.56 49.15V17.6L154.46 8.07L152.88 1.85C152.61 0.76 151.63 0 150.51 0H150.96Z" fill="#161616"/><mask id="mask0_30_2900" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="26" width="54" height="15"><rect y="26.37" width="53.41" height="14.43" fill="url(#paint26_linear_30_2900)"/></mask><g mask="url(#mask0_30_2900)"><path d="M47.03 30.01C47.03 28.75 48.05 27.73 49.31 27.73H50.26C50.3 27.73 50.34 27.75 50.36 27.78C51.14 28.65 51.58 29.78 51.58 30.94V36.2C51.58 37.38 51.14 38.51 50.36 39.38C50.34 39.41 50.3 39.43 50.26 39.43H49.3C48.05 39.43 47.03 38.41 47.03 37.16V30.01Z" fill="black"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.74C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.74 27.41H48.86Z" fill="#262626"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.74C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.74 27.41H48.86Z" fill="url(#paint27_linear_30_2900)"/><path d="M45.02 28.6C45.2 28.6 45.37 28.67 45.5 28.8C46.13 29.44 46.49 30.3 46.49 31.2V35.96C46.49 36.86 46.13 37.72 45.5 38.36C45.37 38.49 45.2 38.56 45.02 38.56H4.62C3.27 38.56 2.17 37.46 2.17 36.11V31.05C2.17 29.7 3.27 28.6 4.62 28.6H45.02Z" fill="black" fill-opacity="0.8"/><path d="M45.02 28.6C45.2 28.6 45.37 28.67 45.5 28.8C46.13 29.44 46.49 30.3 46.49 31.2V35.96C46.49 36.86 46.13 37.72 45.5 38.36C45.37 38.49 45.2 38.56 45.02 38.56H4.62C3.27 38.56 2.17 37.46 2.17 36.11V31.05C2.17 29.7 3.27 28.6 4.62 28.6H45.02Z" fill="#262626" fill-opacity="0.2"/><path d="M45.02 28.6C45.2 28.6 45.37 28.67 45.5 28.8C46.13 29.44 46.49 30.3 46.49 31.2V35.96C46.49 36.86 46.13 37.72 45.5 38.36C45.37 38.49 45.2 38.56 45.02 38.56H4.62C3.27 38.56 2.17 37.46 2.17 36.11V31.05C2.17 29.7 3.27 28.6 4.62 28.6H45.02Z" fill="url(#paint28_radial_30_2900)"/></g><path d="M50.41 27.3C50.41 26.99 50.66 26.74 50.97 26.74H51.13C51.3 26.74 51.44 26.86 51.48 27.02C51.69 27.92 51.79 28.84 51.79 29.77V37.38C51.79 38.31 51.69 39.23 51.48 40.14C51.44 40.3 51.29 40.42 51.13 40.42H50.97C50.66 40.42 50.41 40.17 50.41 39.86V27.3Z" fill="black"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.37 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.75 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="#727272"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.37 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.75 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="url(#paint29_linear_30_2900)"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.17 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.16 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="#262626"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.17 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.16 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="url(#paint30_linear_30_2900)"/><rect x="46.32" y="28.05" width="3.03" height="11.46" rx="1.44" fill="black"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="url(#paint31_radial_30_2900)"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="black" fill-opacity="0.2"/><ellipse opacity="0.8" cx="48.18" cy="33.58" rx="4.79" ry="10.25" fill="url(#paint32_radial_30_2900)"/></g></g></g></svg>`,
  err:`<svg class="cq-set cq-pn" data-k="err" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g class="cq-pnw"><g transform="translate(-134.327 -58.713)"><circle cx="143.07" cy="143.07" r="143.07" fill="url(#paint0_radial_28_2370)" fill-opacity="0.5"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="#333333"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint1_linear_28_2370)"/><path d="M215.91 227.21H161.64L159.83 163.38V59.09H215.91V227.21Z" fill="url(#paint2_linear_28_2370)" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint3_linear_28_2370)"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="#1C1C1C" fill-opacity="0.5"/><path d="M162.45 227.25L158.97 227.01L158.18 216.63L158.46 215.3L161.93 214.05L162.01 207.24L161.65 206.26L163.88 203.18L173.22 192.93L176.53 191.07L184.28 181.42L185.49 182.32L185.18 181.02V107.45H183L160.76 83.45L158.78 80.24V78.98L159.01 64.78L159.43 58.71H160.91H215.89V59.29H160.96L161.63 63.39L163.23 64.64L215.85 64.78V65.94H163.41L162.83 66.91V80.83L164.12 83.45H165.36L166.23 84.35H215.75V85.78H167.61C175.23 93.68 187.09 106.01 187.09 106.11V106.42L215.65 106.11V107.23H187.09V107.45L185.96 108.34V180.84L186.3 182.32L178.68 192.93L175.36 194.15L166.64 204.14H215.86V206.26H164.79L162.86 208.4L162.6 214.33V216.45L162.45 218.79V220.98V227.25Z" fill="url(#paint4_linear_28_2370)"/><path d="M161.98 218.51L161.93 218.3L162.05 218.2L161.98 218.51ZM158.22 216.76L158.18 216.63L158.2 216.52L158.22 216.76ZM215.86 206.26H164.79L162.86 208.4L162.62 213.92L162.6 213.9L162.86 207.97L164.79 205.83H215.86V206.26ZM162.01 206.81L162 207.22L161.65 206.26L161.75 206.12L162.01 206.81ZM186.3 182.32L178.68 192.93L175.36 194.15L167.01 203.71H166.64L175.36 193.72L178.68 192.5L186.23 181.99L186.3 182.32ZM185.18 180.59L185.49 181.89L185.37 181.79L185.18 181.02V180.59ZM215.65 107.23H187.09V107.45L185.96 108.34V107.91L187.09 107.02V106.81H215.65V107.23ZM158.78 79.81L160.76 83.02L183 107.02H185.18V107.45H183L160.76 83.45L158.78 80.24V79.81ZM215.75 85.78H168.02C167.88 85.63 167.74 85.49 167.61 85.35H215.75V85.78ZM215.85 65.94H163.41L162.83 66.91V66.48L163.41 65.51H215.85V65.94ZM215.89 59.85H161.4L161.36 59.27H215.89V59.85Z" fill="black"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="#535353"/><path d="M143.18 66.77V80.15L153.2 221.69L158.5 226.55L162.13 227.38V220.61L162.36 208.38L163.35 205.52L171.69 195.49L175.71 192.68L185.57 182.93L185.76 181.48L185.6 107.94L185.22 107.16L172.06 93.77L159.99 80.73L159.56 58.82L151.01 59.25L143.18 66.77Z" fill="url(#paint5_linear_28_2370)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint6_linear_28_2370)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint7_linear_28_2370)"/><path d="M143.07 213.11V207.09L143.1 78.89H146.2L147.4 77.37H155.57L159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H157.7L150.06 225.18L143.07 213.11Z" fill="url(#paint8_radial_28_2370)"/><path d="M159.93 84.38L178.51 104.81C179.46 105.86 179.98 107.21 179.98 108.62V180.63L158.92 205.76L158.4 216.48L161.38 221.67V227.21H160.72V221.86L157.73 216.67L158.26 205.95L179.32 180.83V108.81C179.32 107.4 178.79 106.05 177.85 105.01L159.26 84.57L154.91 77.56H147.25L147.4 77.37H155.57L159.93 84.38ZM145.54 79.08H143.1V78.89H145.69L145.54 79.08Z" fill="black"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="#343333"/><path d="M152.22 80.88L148.49 84.22L152.96 95.26L164.63 110.15V180.28L153.97 192.69L151.49 200.09L147.96 205.34H154.4C156.21 205.34 157.85 204.25 158.55 202.57L159.28 200.8C159.48 200.33 159.76 199.89 160.1 199.51L161.04 198.48L175.9 181.81C176.39 181.27 176.74 180.61 176.91 179.9L177.44 177.77C177.53 177.42 177.57 177.05 177.57 176.69V112.42C177.57 111.59 177.44 110.77 177.18 109.99C176.86 109.04 176.35 108.16 175.7 107.39L158.91 88.02C158.66 87.74 158.46 87.42 158.31 87.07L156.58 83.08C155.99 81.71 154.63 80.83 153.14 80.86L152.22 80.88Z" fill="url(#paint9_linear_28_2370)"/><path d="M143.47 81.83L140.99 83.89H148.99L152.22 80.88H146.08C145.12 80.88 144.2 81.21 143.47 81.83Z" fill="#8F8F8F"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="#575757"/><path d="M149.89 205.25C148.79 205.52 144.41 204.97 142.36 204.67C141.49 204.54 140.92 204.03 140.37 203.63C140 203.37 139.13 199.8 138.52 196.7C138.29 195.51 137.91 194.35 137.37 193.26L135.19 188.93C134.62 187.8 134.33 186.54 134.33 185.27V103.73V98.55C134.33 97.61 134.62 96.71 135.16 95.95L137.17 93.11C137.94 92.03 138.53 90.82 138.91 89.55L140.32 84.87C140.55 84.11 141.18 83.55 141.97 83.49C144.66 83.27 148.19 83.46 149.22 83.93C150.43 84.49 151.97 90.7 152.29 91.47C152.61 92.25 161.31 102.62 163.74 105.16C165.69 107.18 166.51 110.15 166.68 111.38C166.79 131.25 166.37 169.96 166.27 178.82C166.26 180.02 165.84 181.16 165.08 182.09C162.39 185.38 155.91 193.33 154.67 194.9C153.09 196.89 152.84 199.47 152.42 201.68C152.01 203.88 151.26 204.92 149.89 205.25Z" fill="url(#paint10_linear_28_2370)"/><path d="M145.64 85.97C146.39 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.27 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.81 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.32 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="#8E7878"/><path d="M145.64 85.97C146.39 85.97 147.06 86.3 147.52 86.84H146.29C145.12 86.84 144.12 87.67 143.89 88.81L143.27 91.98C143.22 92.22 143.13 92.46 143.01 92.67L139.73 98.72C139.53 99.08 139.43 99.48 139.43 99.9L139.81 183.96C139.81 184.31 139.89 184.67 140.04 184.99L143.03 191.34C143.13 191.56 143.2 191.8 143.24 192.04L144.16 198.61C144.32 199.71 145.21 200.57 146.31 200.7L149.09 201.01C149.29 201.04 149.5 201.03 149.7 201C149.32 202.03 148.28 202.7 147.15 202.58L143.75 202.22C142.64 202.1 141.75 201.25 141.59 200.14L140.57 193.4C140.54 193.14 140.46 192.9 140.34 192.67L137.11 186.2C136.94 185.86 136.85 185.49 136.85 185.12L136.45 99.32C136.45 98.89 136.56 98.46 136.78 98.08L140.33 91.93C140.46 91.71 140.55 91.46 140.61 91.21L141.3 87.92C141.53 86.78 142.53 85.97 143.69 85.97H145.64Z" fill="url(#paint11_linear_28_2370)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="#2B2B2B"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L161.78 108.12C162.75 109.3 163.29 110.78 163.29 112.3V176.37C163.29 177.85 162.79 179.29 161.87 180.44L151.27 193.73C151.01 194.06 150.84 194.44 150.77 194.85L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint12_linear_28_2370)"/><path d="M147.51 86.84C147.76 87.14 147.95 87.49 148.04 87.89L149.02 92.36C149.11 92.75 149.28 93.1 149.53 93.4L150.61 94.69C150.51 94.88 150.44 95.08 150.4 95.29L149.8 98.16C149.74 98.41 149.65 98.65 149.52 98.88L146.28 104.49C146.07 104.87 145.96 105.3 145.96 105.73L146.33 184.87C146.33 185.25 146.42 185.62 146.59 185.95L149.54 191.86C149.65 192.09 149.73 192.34 149.77 192.59L150.42 196.96L149.82 200.54C149.8 200.7 149.75 200.86 149.7 201C149.5 201.03 149.29 201.04 149.09 201.01L146.31 200.7C145.21 200.57 144.32 199.72 144.16 198.61L143.24 192.04C143.2 191.8 143.13 191.56 143.03 191.34L140.04 184.99C139.89 184.67 139.81 184.31 139.8 183.96L139.43 99.9C139.43 99.48 139.53 99.08 139.73 98.72L143.01 92.68C143.13 92.46 143.22 92.22 143.27 91.98L143.89 88.81C144.12 87.67 145.12 86.84 146.29 86.84H147.51Z" fill="url(#paint13_linear_28_2370)"/><g filter="url(#filter0_d_28_2370)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="#151515"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_28_2370)"/><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" stroke="#E46464" stroke-width="0.3"/></g><path d="M151 122.43C151 120.73 152.32 119.31 154.02 119.18L155.14 119.09C156.56 118.98 157.78 120.11 157.78 121.53V166.18C157.78 167.85 156.2 169.07 154.58 168.66L153.46 168.38C152.02 168.01 151 166.7 151 165.21V122.43Z" fill="#0B0B0B"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint15_linear_28_2370)"/><rect x="151.11" y="137.56" width="6.77" height="12.93" fill="url(#paint16_linear_28_2370)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint17_linear_28_2370)"/><rect x="151.11" y="152.41" width="6.77" height="12.93" fill="url(#paint18_linear_28_2370)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="#7E7E7E"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint19_linear_28_2370)"/><rect x="151.11" y="122.72" width="6.77" height="12.93" fill="url(#paint20_linear_28_2370)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint21_linear_28_2370)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint22_linear_28_2370)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint23_linear_28_2370)"/><ellipse opacity="0.8" cx="152.22" cy="143.25" rx="10.36" ry="16.04" fill="url(#paint24_radial_28_2370)"/><ellipse opacity="0.8" cx="152.22" cy="128.03" rx="10.36" ry="16.04" fill="url(#paint25_radial_28_2370)"/><ellipse opacity="0.8" cx="152.22" cy="157.85" rx="10.36" ry="16.04" fill="url(#paint26_radial_28_2370)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint27_linear_28_2370)"/><ellipse cx="151.33" cy="158.87" rx="3.06" ry="6.46" fill="url(#paint28_radial_28_2370)"/><path d="M151.65 152.41C153.34 152.41 154.71 155.3 154.71 158.87C154.71 162.44 153.34 165.34 151.65 165.34C151.6 165.34 151.55 165.33 151.5 165.33C153.11 165.16 154.4 162.34 154.4 158.87C154.4 155.41 153.11 152.59 151.5 152.42C151.55 152.41 151.6 152.41 151.65 152.41Z" fill="black"/><path d="M151.65 137.56C153.34 137.56 154.71 140.46 154.71 144.03C154.71 147.6 153.34 150.49 151.65 150.49C151.6 150.49 151.55 150.49 151.5 150.48C153.11 150.32 154.4 147.49 154.4 144.03C154.4 140.57 153.11 137.74 151.5 137.57C151.55 137.57 151.6 137.56 151.65 137.56Z" fill="black"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint29_linear_28_2370)"/><ellipse cx="151.33" cy="144.03" rx="3.06" ry="6.46" fill="url(#paint30_radial_28_2370)"/><ellipse cx="150.51" cy="129.18" rx="2.24" ry="4.73" fill="#464646"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="#7E7E7E"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint31_linear_28_2370)"/><ellipse cx="151.33" cy="129.18" rx="3.06" ry="6.46" fill="url(#paint32_radial_28_2370)"/><ellipse cx="150.77" cy="129.18" rx="2.5" ry="5.32" fill="url(#paint33_linear_28_2370)"/><ellipse cx="150.77" cy="143.93" rx="2.5" ry="5.32" fill="url(#paint34_linear_28_2370)"/><ellipse cx="150.77" cy="158.87" rx="2.5" ry="5.32" fill="url(#paint35_linear_28_2370)"/><path d="M151.65 122.72C153.34 122.72 154.71 125.61 154.71 129.18C154.71 132.75 153.34 135.65 151.65 135.65C151.6 135.65 151.55 135.64 151.5 135.64C153.11 135.47 154.4 132.65 154.4 129.18C154.4 125.72 153.11 122.89 151.5 122.73C151.55 122.72 151.6 122.72 151.65 122.72Z" fill="black"/><g class="cq-glow" filter="url(#filter0_d_28_2370)"><path d="M162.68 112.3C162.68 110.92 162.19 109.58 161.31 108.52L149.06 93.79C148.75 93.42 148.53 92.97 148.43 92.5L147.44 88.02C147.25 87.18 146.51 86.58 145.64 86.58H143.69C142.83 86.58 142.07 87.19 141.9 88.04L141.21 91.33C141.14 91.65 141.02 91.96 140.86 92.24L137.31 98.39C137.15 98.67 137.06 98.99 137.06 99.32L137.46 185.11C137.47 185.4 137.53 185.67 137.66 185.93L140.89 192.39C141.03 192.68 141.13 192.99 141.18 193.31L142.19 200.05C142.32 200.88 142.98 201.52 143.81 201.61L147.21 201.97C148.18 202.07 149.06 201.4 149.22 200.44L150.17 194.75C150.25 194.24 150.47 193.76 150.79 193.35L161.39 180.06C162.22 179.01 162.68 177.71 162.68 176.37V112.3ZM163.9 176.37C163.9 177.99 163.35 179.56 162.34 180.82L151.75 194.11C151.56 194.36 151.43 194.65 151.38 194.96L150.43 200.65C150.16 202.24 148.69 203.36 147.08 203.19L143.69 202.82C142.3 202.68 141.19 201.61 140.98 200.23L139.97 193.49C139.94 193.3 139.88 193.11 139.8 192.94L136.56 186.47C136.35 186.05 136.24 185.59 136.24 185.12L135.84 99.32C135.83 98.78 135.98 98.25 136.25 97.78L139.8 91.62C139.9 91.46 139.97 91.27 140.01 91.08L140.7 87.79C141 86.37 142.25 85.36 143.69 85.36H145.64C147.08 85.36 148.32 86.35 148.63 87.76L149.62 92.23C149.68 92.52 149.81 92.79 150 93.01L162.25 107.73C163.32 109.02 163.9 110.63 163.9 112.3V176.37Z" fill="url(#paint14_radial_28_2370)"/></g></g></g></svg><svg class="cq-set cq-cnv" data-k="err" viewBox="-474.6 -49.5 726.6 173" preserveAspectRatio="xMaxYMid slice"><g mask="url(#cqCut)"><g class="cq-cn"><g class="cq-shift"><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="#464646"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint0_linear_30_3023)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint1_linear_30_3023)"/><path d="M170.83 15.03L170.94 15.04C172.13 15.17 173.07 17.24 173.07 19.77C173.07 22.3 172.13 24.36 170.94 24.49L170.83 24.5H157.3V15.03H170.83Z" fill="url(#paint2_linear_30_3023)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="black"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint3_radial_30_3023)"/><path d="M170.23 15.91C171.25 15.91 172.07 17.63 172.07 19.77C172.07 21.83 171.3 23.52 170.32 23.62L170.23 23.63H152.57V15.91H170.23Z" fill="url(#paint4_linear_30_3023)" fill-opacity="0.1"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="#464646"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint5_linear_30_3023)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint6_linear_30_3023)"/><path d="M170.83 29.88L170.94 29.89C172.13 30.01 173.07 32.08 173.07 34.61C173.07 37.14 172.13 39.21 170.94 39.34L170.83 39.34H157.3V29.88H170.83Z" fill="url(#paint7_linear_30_3023)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="black"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint8_radial_30_3023)"/><path d="M170.23 30.75C171.25 30.75 172.07 32.48 172.07 34.61C172.07 36.68 171.3 38.36 170.32 38.47L170.23 38.47H152.57V30.75H170.23Z" fill="url(#paint9_linear_30_3023)" fill-opacity="0.1"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="#464646"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint10_linear_30_3023)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint11_linear_30_3023)"/><path d="M170.83 44.73L170.94 44.73C172.13 44.86 173.07 46.93 173.07 49.46C173.07 51.99 172.13 54.06 170.94 54.18L170.83 54.19H157.3V44.73H170.83Z" fill="url(#paint12_linear_30_3023)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="black"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint13_radial_30_3023)"/><path d="M170.23 45.6C171.25 45.6 172.07 47.33 172.07 49.46C172.07 51.52 171.3 53.21 170.32 53.31L170.23 53.32H152.57V45.6H170.23Z" fill="url(#paint14_linear_30_3023)" fill-opacity="0.1"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.53 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.53 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint15_linear_30_3023)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.53 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="#BEAAAA"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.53 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint16_linear_30_3023)"/><path d="M149.36 4.98C149.36 3.21 150.8 1.77 152.57 1.77H153.91C154.23 1.77 154.53 1.95 154.7 2.23C157.4 6.94 158.82 12.27 158.82 17.7V49.78C158.82 55.22 157.4 60.57 154.7 65.3C154.53 65.59 154.23 65.77 153.9 65.77H152.57C150.8 65.77 149.36 64.33 149.36 62.56V4.98Z" fill="url(#paint17_radial_30_3023)"/><path d="M79.1 0.92C79.5 1.23 79.81 1.66 79.96 2.18L81.26 6.68C81.58 7.79 81.75 8.94 81.75 10.09V57.21C81.75 58.36 81.58 59.5 81.27 60.6L79.96 65.15C79.83 65.57 79.6 65.94 79.3 66.23C77.04 65.9 75.17 64.21 74.66 61.93L73.28 55.75C73.31 55.37 73.33 55 73.33 54.62V12.68C73.33 12.24 73.31 11.79 73.26 11.35L74.88 4.27C75.32 2.31 77.07 0.92 79.08 0.92H79.1Z" fill="url(#paint18_linear_30_3023)"/><path d="M149.02 0.52C150.14 0.52 151.12 1.28 151.39 2.37L152.56 6.98C152.81 7.96 152.93 8.97 152.93 9.98V57.52C152.93 58.53 152.81 59.54 152.56 60.52L151.39 65.17C151.12 66.26 150.14 67.02 149.01 67.02H80.23C79.28 67.02 77.34 65.95 75.73 64.35C77.01 65.24 78 65.41 78.73 65.26C80.34 64.95 80.7 62.94 80.97 61.33C81.38 58.94 81.58 56.53 81.58 54.11V9.98C81.58 8.97 81.45 7.96 81.2 6.98L80.18 2.92C79.99 2.18 78.24 0.7 76.56 1.58C77.64 0.4 79.92 0.52 80.64 0.52H149.02Z" fill="url(#paint19_linear_30_3023)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.72 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint20_linear_30_3023)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.72 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint21_linear_30_3023)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H81.45C80.89 67.54 80.38 67.35 79.97 67.04C80.4 66.71 80.72 66.24 80.86 65.69L82.07 60.91C82.32 59.93 82.44 58.93 82.44 57.92V9.59C82.44 8.58 82.31 7.57 82.07 6.59L80.87 1.85C80.73 1.29 80.4 0.82 79.97 0.5C80.38 0.19 80.89 0 81.45 0H150.96Z" fill="url(#paint22_radial_30_3023)" fill-opacity="0.4"/><path d="M74.88 13.69C74.88 12.61 75.75 11.74 76.82 11.74H77.5C77.99 11.74 78.42 12.08 78.54 12.55C79.28 15.48 79.66 18.48 79.66 21.5V45.61C79.66 48.64 79.28 51.65 78.54 54.59C78.42 55.07 77.99 55.41 77.49 55.41H76.82C75.75 55.41 74.88 54.54 74.88 53.46V13.69Z" fill="black"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.15 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.5 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="#2D2D2D"/><path d="M52.26 11.18C52.11 11.28 51.96 11.38 51.84 11.51C52.15 11.81 52.39 12.21 52.51 12.66L53.04 14.75C53.28 15.73 53.41 16.74 53.41 17.76V49.23C53.41 50.24 53.29 51.24 53.04 52.22L52.5 54.34C52.39 54.8 52.15 55.19 51.84 55.5C51.93 55.59 52.04 55.68 52.15 55.75C50.7 55.63 49.46 54.61 49.09 53.19L48.18 49.77C48.32 49.01 48.4 48.24 48.4 47.46V19.53C48.4 18.71 48.31 17.89 48.15 17.09L49.23 13.14C49.55 11.97 50.61 11.16 51.82 11.16L52.26 11.18Z" fill="url(#paint23_linear_30_3023)"/><path d="M66.11 10.88C67.24 10.88 68.21 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.21 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L52.99 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.23 11.15 52.84 10.88 53.5 10.88H66.11Z" fill="#727272"/><path d="M66.11 10.88C67.24 10.88 68.21 11.65 68.49 12.73L69.02 14.82C69.27 15.81 69.39 16.82 69.39 17.83V49.3C69.39 50.31 69.27 51.32 69.02 52.29L68.49 54.42C68.21 55.5 67.24 56.27 66.11 56.27H53.5C52.84 56.27 52.23 56 51.79 55.57C52.11 55.26 52.35 54.87 52.46 54.42L52.99 52.29C53.24 51.32 53.37 50.31 53.37 49.3V17.83C53.37 16.82 53.24 15.81 52.99 14.82L52.46 12.73C52.35 12.28 52.11 11.89 51.79 11.58C52.23 11.15 52.84 10.88 53.5 10.88H66.11Z" fill="url(#paint24_linear_30_3023)"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="#262626"/><path d="M75.4 10.53C76.52 10.53 77.5 11.29 77.77 12.38L78.32 14.56C78.57 15.54 78.7 16.55 78.7 17.56V49.57C78.7 50.58 78.57 51.58 78.33 52.56L77.77 54.77C77.5 55.86 76.52 56.62 75.4 56.62H54.66C54 56.62 53.4 56.36 52.96 55.93C53.28 55.62 53.52 55.22 53.64 54.77L54.19 52.56C54.44 51.58 54.56 50.58 54.56 49.57V17.56C54.56 16.55 54.44 15.54 54.19 14.56L53.64 12.38C53.52 11.93 53.28 11.53 52.96 11.22C53.4 10.79 54 10.53 54.66 10.53H75.4Z" fill="url(#paint25_linear_30_3023)"/><path d="M150.96 0C152.08 0 153.06 0.76 153.33 1.85L154.91 8.07L156.01 17.6V49.15L154.91 59.44L153.33 65.69C153.06 66.78 152.08 67.54 150.95 67.54H150.51C151.63 67.54 152.61 66.78 152.88 65.69L154.46 59.44L155.56 49.15V17.6L154.46 8.07L152.88 1.85C152.61 0.76 151.63 0 150.51 0H150.96Z" fill="#161616"/><mask id="mask0_30_3023" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="26" width="54" height="15"><rect y="26.37" width="53.41" height="14.43" fill="url(#paint26_linear_30_3023)"/></mask><g mask="url(#mask0_30_3023)"><path d="M47.03 30.01C47.03 28.75 48.05 27.73 49.31 27.73H50.26C50.3 27.73 50.34 27.75 50.36 27.78C51.14 28.65 51.58 29.78 51.58 30.94V36.2C51.58 37.38 51.14 38.51 50.36 39.38C50.34 39.41 50.3 39.43 50.26 39.43H49.3C48.05 39.43 47.03 38.41 47.03 37.16V30.01Z" fill="black"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.75C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.75 27.41H48.86Z" fill="#262626"/><path d="M48.86 27.41C49.1 27.41 49.33 27.51 49.49 27.69C50.18 28.46 50.56 29.45 50.56 30.49V36.66C50.56 37.7 50.18 38.7 49.49 39.47C49.33 39.65 49.1 39.75 48.86 39.75H3.75C2.39 39.75 1.3 38.66 1.3 37.3V29.86C1.3 28.5 2.39 27.41 3.75 27.41H48.86Z" fill="url(#paint27_linear_30_3023)"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="black" fill-opacity="0.8"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="#262626" fill-opacity="0.2"/><path d="M45.12 28.6C45.3 28.6 45.47 28.67 45.59 28.8C46.23 29.44 46.59 30.3 46.59 31.2V35.96C46.59 36.86 46.23 37.72 45.6 38.36C45.47 38.49 45.29 38.56 45.11 38.56H4.72C3.36 38.56 2.27 37.46 2.27 36.11V31.05C2.27 29.7 3.36 28.6 4.72 28.6H45.12Z" fill="url(#paint28_radial_30_3023)"/></g><path d="M50.42 27.3C50.42 26.99 50.66 26.74 50.97 26.74H51.13C51.3 26.74 51.44 26.86 51.48 27.02C51.69 27.92 51.79 28.84 51.79 29.77V37.38C51.79 38.31 51.69 39.23 51.48 40.14C51.44 40.3 51.29 40.42 51.13 40.42H50.97C50.66 40.42 50.42 40.17 50.42 39.86V27.3Z" fill="black"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.38 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.75 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="#727272"/><path d="M47.14 26.48C47.73 26.48 48.24 26.88 48.38 27.46C48.49 27.93 48.54 28.42 48.54 28.9V38.25C48.54 38.73 48.49 39.22 48.38 39.69C48.24 40.27 47.72 40.69 47.13 40.69H45.7C44.91 40.69 44.2 40.3 43.75 39.71C43.75 39.7 43.75 39.7 43.76 39.69C43.87 39.22 43.92 38.73 43.92 38.25V28.9C43.92 28.42 43.87 27.93 43.75 27.46C43.75 27.46 43.75 27.45 43.75 27.45C44.2 26.86 44.91 26.48 45.7 26.48H47.14Z" fill="url(#paint29_linear_30_3023)"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.17 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.17 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="#262626"/><path d="M49.87 26.37C50.47 26.37 50.99 26.78 51.13 27.36C51.24 27.85 51.3 28.34 51.3 28.83V38.32C51.3 38.81 51.24 39.31 51.13 39.79C51 40.38 50.47 40.8 49.86 40.8H46.12C45.32 40.8 44.61 40.41 44.16 39.82C44.17 39.81 44.17 39.8 44.17 39.79C44.29 39.31 44.34 38.81 44.34 38.32V28.83C44.34 28.34 44.29 27.85 44.17 27.36C44.17 27.35 44.17 27.34 44.17 27.34C44.61 26.75 45.32 26.37 46.12 26.37H49.87Z" fill="url(#paint30_linear_30_3023)"/><rect x="46.32" y="28.05" width="3.03" height="11.46" rx="1.44" fill="black"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="url(#paint31_radial_30_3023)"/><rect x="46.49" y="28.21" width="2.69" height="11.14" rx="1.35" fill="black" fill-opacity="0.2"/><ellipse opacity="0.8" cx="48.15" cy="33.58" rx="4.79" ry="10.25" fill="url(#paint32_radial_30_3023)"/></g></g></g></svg>`
};
const CQ = {
  PANEL_W : 82,      /* ширина панели в единицах холста */
  PANEL_H : 169,     /* её высота */
  PX0     : 170,     /* опорная посадка: при ней коннектор в нуле */
  SHIFT_X : 25.25,   /* холст без маски → холст маски */
  SHIFT_Y : 3,
  /* Запас ширины кадра. Пока блок не шире этого отношения,
     масштаб берётся по высоте и панель занимает её целиком.
     Блок в попапе примерно 3:1 — запас с походом. */
  FRAME_RATIO: 4.2,
};
const cqScene = $('#cqScene');
let cqState = 'base', cqMoveT;

/* Настройки читаем из css-переменных блока: править их удобнее
   там, рядом с описанием, чем искать числа в скрипте. */
function cqVar(name, def){
  const v = getComputedStyle($('.power')).getPropertyValue(name).trim();
  return v === '' ? def : parseFloat(v);
}

/* Кадр больше не зависит от того, какого размера блок и когда
   его успели измерить. Раньше ширина кадра подгонялась под
   пропорцию блока: стоило замеру прийти до окончательной
   раскладки — пропорции расходились, svg добавлял поля, и
   сцена мельчала вдвое. Теперь кадр считается только из
   настроек, а вписывание отдано браузеру: slice берёт масштаб
   по большей стороне, поэтому высота блока заполняется всегда.
   Ширина кадра взята с запасом — лишнее уходит за левую
   кромку, где только провод.
   Правый край сидит на правом крае панели и прижат к правой
   стене (xMax): полосы фона справа не появится. */
function cqLayout(){
  if(!cqScene) return;
  const px  = cqVar('--cq-panel-x', 170);
  const pad = cqVar('--cq-pad', 0);
  const py  = cqVar('--cq-py', -47.5);
  const h = (CQ.PANEL_H + pad * 2) / cqVar('--cq-zoom', 1);
  const w = h * CQ.FRAME_RATIO;
  /* панель по вертикали держим в середине кадра */
  const y = py + CQ.PANEL_H / 2 - h / 2;
  const vb = (px + CQ.PANEL_W - w) + ' ' + y + ' ' + w + ' ' + h;
  $$('.cq svg').forEach(v => v.setAttribute('viewBox', vb));
  /* Диагностика на случай «сцена мелкая». Показывает, что
     реально посчиталось: размер блока, высоту кадра и долю,
     которую займёт панель. Смотреть в инспекторе на #cqScene,
     атрибут data-frame. Если доля близка к 100, а на экране
     мельче — дело не в настройках. */
  const b = $('.power').getBoundingClientRect();
  cqScene.dataset.frame = 'блок ' + Math.round(b.width) + '×' + Math.round(b.height) +
    ' | кадр ' + Math.round(w) + '×' + Math.round(h) +
    ' | панель ' + Math.round(169 / h * 100) + '% высоты';
  $$('.cq-pnw').forEach(g => g.setAttribute('transform', 'translate(' + px + ' ' + py + ')'));
  $$('.cq-shift').forEach(g => g.setAttribute('transform', 'translate(' + CQ.SHIFT_X + ' ' + CQ.SHIFT_Y + ')'));
  cqApplyMove();
}

/* Ход коннектора. Точка стыковки едет вместе с панелью — значит
   коннектор дойдёт до пинов, где бы гнездо ни стояло, а отвод
   отсчитывается от неё, а не от нуля холста. */
function cqOffset(st){
  const dock = (cqVar('--cq-panel-x', 170) - CQ.PX0) + cqVar('--cq-seat', 0);
  const gap  = cqVar('--cq-gap', 46);
  return st === 'on'   ? dock
       : st === 'busy' ? dock - gap * 0.34
       : dock - gap;
}
function cqApplyMove(){
  /* внутри svg пиксель равен пользовательской единице, поэтому
     сдвиг ставится прямо в единицах холста */
  const off = cqOffset(cqState);
  $$('.cq-cn').forEach(el => el.style.transform = 'translateX(' + off + 'px)');
}

/* Где коннектор видимого комплекта СЕЙЧАС — с учётом идущего хода.
   Этап 4: фон отвечает за десятки миллисекунд, и состояния сменяют друг
   друга быстрее, чем коннектор доезжает (ход 1,05 с). Новый комплект
   обязан стартовать из точки, где коннектор находится на самом деле, а не
   из конца прошлого хода — иначе при первом включении он появлялся у
   гнезда, пока уходящий ещё в пути: «телепорт». Читаем матрицу
   вычисленного стиля; нечего читать — берём расчётную точку состояния. */
function cqCurrentOffset(k){
  const el = cqScene.querySelector('.cq-set[data-k="' + k + '"] .cq-cn');
  const m = el ? getComputedStyle(el).transform : '';
  /* браузер отдаёт matrix(a, b, c, d, e, f) либо matrix3d(…): сдвиг по X —
     пятое число у первой и тринадцатое у второй */
  const n = m && m.startsWith('matrix') ? m.slice(m.indexOf('(') + 1, -1).split(',').map(parseFloat) : null;
  if(!n || n.some(Number.isNaN)) return cqOffset(k);
  return n.length === 16 ? n[12] : n[4];
}

function cqSet(next){
  if(!cqScene || next === cqState) return;
  const prev = cqState;
  cqState = next;
  cqScene.dataset.cs = next;
  const cur = cqCurrentOffset(prev);
  /* комплекта может ещё не быть в DOM — доносим и сразу
     раскладываем, иначе он появится без viewBox */
  if(CQ_LAZY[next]){
    cqScene.insertAdjacentHTML('beforeend', CQ_LAZY[next]);
    delete CQ_LAZY[next];
    cqLayout();
  }
  /* Приходящий комплект ставим туда, где стоит уходящий, гасим переход
     на один кадр и только потом отпускаем: иначе он появился бы сразу в
     конечной точке — прыжок при первом включении. Остальные комплекты не
     трогаем: их коннекторы доедут до новой точки своим ходом (этап 4:
     раньше в эту точку сдвигались все, и идущий ход обрывался рывком) */
  const fresh = $$('.cq-set[data-k="' + next + '"] .cq-cn');
  fresh.forEach(el => {
    el.style.transition = 'none';
    el.style.transform  = 'translateX(' + cur + 'px)';
  });
  /* у svg нет свойства hidden — только атрибут: свойство живёт
     у HTMLElement, и присваивание ему молча не сработало бы */
  $$('.cq-set').forEach(el => { if(el.dataset.k === next) el.removeAttribute('hidden'); });
  void cqScene.offsetWidth;            /* заставляем браузер учесть стартовую точку */
  fresh.forEach(el => el.style.transition = '');
  requestAnimationFrame(() => {
    $$('.cq-set').forEach(el => el.classList.toggle('on', el.dataset.k === next));
    cqApplyMove();
    /* will-change поднимает слой на время хода и снимается
       после: постоянный держит память впустую */
    $$('.cq-cn').forEach(el => el.classList.add('move'));
    clearTimeout(cqMoveT);
    cqMoveT = setTimeout(() => {
      $$('.cq-cn').forEach(el => el.classList.remove('move'));
      $$('.cq-set').forEach(el => { if(el.dataset.k !== cqState) el.setAttribute('hidden', ''); });
    }, 1200);
  });
}

/* Состояние сцены выводится из состояния соединения: своей
   памяти у неё нет, иначе они разошлись бы при первом обрыве. */
function cqSync(){
  const pw = power();
  cqSet(heroError() ? 'err' : pw === 'busy' ? 'busy' : pw === 'on' ? 'on' : 'base');
}

if(cqScene){
  $$('.cq-set').forEach(el => { if(el.dataset.k === 'base') el.classList.add('on'); });
  cqLayout();
  /* Первый замер часто приходит до того, как блок получил
     окончательный размер: шрифты ещё грузятся, раскладка ещё
     не устоялась. ResizeObserver ловит изменение, но если
     размер не менялся — второго вызова не будет, и сцена
     останется с прикидочным кадром. Поэтому пересчитываем ещё
     раз по загрузке и один раз с задержкой. */
  window.addEventListener('load', cqLayout);
  setTimeout(cqLayout, 300);
  if(window.ResizeObserver) new ResizeObserver(cqLayout).observe($('.power'));
  else window.addEventListener('resize', cqLayout);
}

/* ── 2.6.1 · «Выход»: адрес, который видят сайты ──────────────────────────
 * Фон сразу после включения спрашивает внешнюю службу через текущее
 * соединение и кладёт ответ в state (exitIp/exitCc/exitCity/exitVia), а свой
 * адрес — в directIp (когда прокси выключен). Здесь он показывается строкой
 * под героем вместе с кнопкой «Обновить страницу»: страница, открытая до
 * включения, показывает старый адрес, и человек принимает это за поломку.
 * Состояния: ok — адрес есть; same — совпал со своим (повод искать ошибку);
 * wait — ждём ответ; fail — служба не ответила.
 * Пересборки нет: строка одна, меняются только тексты и data-state.
 */
let exitKey = '';   /* что уже нарисовано — чтобы не дёргать DOM зря */
let exitReloadT = null;
function renderExit(){
  const box = $('#exitRow');
  if(!box) return;
  const reload = $('#exReload'), ipEl = $('#exIp'), metaEl = $('#exMeta'), lblEl = $('#exLbl');

  /* 2.6.1: при ошибке строку не показываем — про сбой уже говорит герой и
     тост; две красные строки об одном и том же только пугают */
  if(!st.enabled || st.lastError){
    box.hidden = true;
    exitKey = '';
    return;
  }
  box.hidden = false;

  /* 2.6.1: кнопка всегда доступна — цель находится в момент нажатия
     (pageTarget ниже). Прежняя проверка «есть ли вкладка» отключала её на
     служебных адресах, а человек в это время видел страницу, которую надо
     перезагрузить. Подсказка объясняет, что произойдёт. */
  reload.disabled = false;

  const lbl = msg('exitLbl');
  if(lblEl.textContent !== lbl) lblEl.textContent = lbl;

  /* ответа ещё нет: либо проверка идёт, либо служба промолчала — и это
     разные строки, «Смотрим адрес…» навсегда было бы ложью */
  if(st.exitVia !== 'proxy' || !st.exitIp){
    const tried = typeof st.exitAsk === 'number' && st.exitAsk > 0;
    box.dataset.state = tried ? 'fail' : 'wait';
    if(ipEl.textContent) ipEl.textContent = '';
    const line = msg(tried ? 'exitNoAnswer' : 'exitWait');
    if(metaEl.textContent !== line) metaEl.textContent = line;
    exitKey = '';
    return;
  }

  const same = Boolean(st.directIp && st.directIp === st.exitIp);
  /* 2.6.1: страна — названием, как в строках списка («United States, The Dalles»),
     а не кодом: код рядом с флагом читается как мусор */
  const place = geoPlace({ cc: st.exitCc, city: st.exitCity });
  const key = [st.exitIp, st.exitCc, st.exitCity, same ? 'same' : 'ok'].join('|');
  box.dataset.state = same ? 'same' : 'ok';
  if(ipEl.textContent !== st.exitIp) ipEl.textContent = st.exitIp;
  if(exitKey !== key){
    exitKey = key;
    metaEl.innerHTML = same
      ? esc(msg('exitSame'))
      : (st.exitCc ? flag(st.exitCc) : '') + esc(place || msg('exitSeen'));
  }
}

/* 2.6.1: попап — не вкладка, поэтому активная вкладка окна всегда сайт. Но
   если эту же страницу открыть вкладкой (разработка, отладка), «активной»
   сначала будет она сама; при возврате к окну перечитываем вкладку, чтобы
   кнопки «Обновить страницу» и строка сайта говорили о настоящей странице. */
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState !== 'visible') return;
  readTab().then(() => { siteIcon($('#stIco')); renderSite(); renderExit(); }).catch(() => {});
});

/* 2.6.1: какая вкладка должна перезагрузиться. Обычный попап сам вкладкой не
   является — активная вкладка окна и есть страница под ним. Но тот же файл
   открывается и вкладкой (отладка, окно-попап), и тогда «активная» — он сам;
   в этом случае берём активную вкладку обычного окна. */
async function pageTarget(){
  /* цель — только http(s): у служебных и своих страниц url бывает null, и
     такая вкладка не то, что человек видит под попапом */
  const isPage = (t) => Boolean(t) && typeof t.id === 'number' && typeof t.url === 'string' && /^https?:/i.test(t.url);
  try{
    const t = (await chrome.tabs.query({ active:true, currentWindow:true }))[0];
    if(isPage(t)) return t;
  }catch(err){ /* ниже — общий путь */ }
  try{
    const wins = await chrome.windows.getAll({ windowTypes:['normal'], populate:true });
    const w = wins.find(x => x.focused) || wins[0];
    const t = w && Array.isArray(w.tabs) ? w.tabs.find(x => x.active && isPage(x)) : null;
    if(isPage(t)) return t;
  }catch(err){ /* вкладки нет */ }
  return null;
}

$('#exitRow')?.addEventListener('click', async (e) => {
  if(e.target.closest('#exReload')){
    /* 2.6.1: цель ищем в момент нажатия — кнопка должна вести к той странице,
       которую человек видит сейчас */
    const t = await pageTarget();
    if(!t) return;
    tabId = t.id;
    tabInfo = tabHost(t.url || '') ? { url:t.url, host:tabHost(t.url) } : null;
    /* 2.6.1: перезагрузка мимо кэша — сайт, отдавший адрес из кэша, иначе
       показал бы старый даже после обычного reload */
    try{ await chrome.tabs.reload(t.id, { bypassCache: true }); }
    catch(err){ console.error('[pxs] не удалось перезагрузить вкладку:', err); }
    /* короткая отметка, что нажатие сработало: строка гаснет и возвращается */
    const box = $('#exitRow');
    box.style.opacity = '.55';
    clearTimeout(exitReloadT);
    exitReloadT = setTimeout(() => { box.style.opacity = ''; }, 900);
    return;
  }
  /* клик по самой строке — перепроверить адрес */
  chrome.runtime.sendMessage({ cmd:'checkExit' }).catch(() => {});
});

/* 2.6: подсказка под кнопкой питания — «тип угадан по порту, проверьте».
   Одна кнопка на всё окно, создаётся при первой отрисовке и дальше только
   прячется: пересоздание на каждом кадре сбивало бы фокус и мигало. */
let typeHintEl = null;
function renderTypeHint(){
  if(!typeHintEl){
    typeHintEl = document.createElement('button');
    typeHintEl.type = 'button';
    typeHintEl.id = 'typeHint';
    typeHintEl.className = 'type-hint';
    const b = $('#btnPower');
    if(b && b.parentNode) b.parentNode.insertBefore(typeHintEl, b.nextSibling);
    typeHintEl.addEventListener('click', () => {
      const p = active();
      openPage(p ? { go:'proxy', id:p.id } : { go:'proxy' });
    });
  }
  const p = active();
  const show = Boolean(st.enabled && st.lastError === 'dead' && p && p.typeGuess === true);
  typeHintEl.hidden = !show;
  if(show && typeHintEl.textContent !== msg('errHintType')) typeHintEl.textContent = msg('errHintType');
}

function renderPower(){
  cqSync();   /* отрисовка коннектора идёт следом за состоянием */
  renderTypeHint();
  renderExit();   /* 2.6.1: адрес, который видят сайты, и кнопка перезагрузки */
  const pw = power(), err = heroError();
  pop.dataset.power = err ? 'err' : pw;
  /* 7К.2 (Г-1, решение человека 26.09): мышь с кнопки снимается (CSS
     pointer-events по data-hold) только на удержание расстыковки и ответ
     фона (busy || reconn), не на проверку при подключении — во время
     «Подключение» выключить можно и мышью, как клавиатурой; data-power
     «busy» и подпись pwrBusy при проверке остаются */
  if(busy || reconn) pop.dataset.hold = ''; else delete pop.dataset.hold;
  const b = $('#btnPower');
  b.disabled = !proxies.length;
  b.setAttribute('aria-busy', String(pw === 'busy'));
  b.setAttribute('aria-checked', String(pw === 'on'));
  b.setAttribute('aria-label', msg('pwrAria'));
  $('#pLabel').textContent =
    err ? msg('pwrFail')
    : pw === 'busy' ? msg('pwrBusy')   /* 7В: занято и проверкой при подключении — та же подпись */
    : pw === 'on'   ? msg('pwrOff')
    : msg('pwrOn');
}

/* срыв: герой коротко горит красным, причину объявляет тост */
function showFail(kind){
  heroErr = kind;
  renderPower();
  toast(errText(kind), true);
  clearTimeout(heroErrT);
  heroErrT = setTimeout(() => { heroErr = null; renderPower(); }, 2800);
}
/* этап 4: включение — сообщение фону, а не таймер. id — кого включаем:
   результат засчитывается только этому прокси и этому поколению; новый
   выбор, выключение и добавление поднимают connGen, и устаревший ответ
   не трогает ни герой, ни тост. Отказ только по сроку и по ответу фона:
   3Б.2 — случайных отказов прототипа нет (решение 01.09); ветки auth и
   dead читают state.lastError по подписке — 'auth' ставит обработчик
   авторизации фона, 'dead' — фон по обрыву на трафике (7Б) и по
   проверке при подключении (7В). */
async function connect(id, doneMsg){
  const p0 = proxies.find(p => p.id === id);
  if(!p0){ toast(msg('pickFirst'), true); return; }
  /* истёкший прокси не включается никогда. Соединение было включено на
     другом прокси — выключаем: селектор уже показывает новый выбор, и
     гнать трафик через прежний, молча, нельзя */
  if(isExpired(p0)){
    const wasBusy = busy;
    connGen++; busy = false;
    endReconn();   /* 4.2: срыв показывается сразу, без удержания */
    /* включено — или включается: устаревшая попытка могла успеть дойти
       до браузера, выключаем и в этом случае, выключение безвредно */
    if(st.enabled || wasBusy){
      const res = await send({ cmd:'disable' });
      if(!res.ok){ await refreshState(); showFail(res.error); return; }
    }
    try{ await state.patchState({ activeProxyId: id }); }
    catch(err){ console.error('[pxs] не удалось записать выбор:', err); }
    await refreshState();
    renderSel(); showFail('exp');
    return;
  }
  busy = true; heroErr = null;
  clearTimeout(heroErrT);
  const gen = ++connGen;
  renderPower();
  const res = await send({ cmd: st.enabled ? 'switch' : 'enable', id });
  if(gen !== connGen) return;   /* попытка устарела: новый выбор или выключение */
  busy = false;
  await refreshState();
  if(gen !== connGen) return;
  if(!res.ok){ endReconn(); renderSel(); showFail(res.error); return; }   /* 4.2: срыв — сразу */
  renderPower(); renderSel();
  if(doneMsg && res.reloaded === true) doneMsg += msg('tabReloaded');   /* 7Б: хвост только когда фон вкладку действительно перезагрузил (тумблер, обычная страница) */
  if(doneMsg){ if(reconn || probing()) reconnMsg = doneMsg; else toast(doneMsg); }   /* 4.2: тост — после удержания; 7В: и после проверки */
}
/* 4.2 (пересмотр решения 09.09 «без выдуманной паузы» — только для смены
   на лету, запись в DECISIONS): смена прокси при включённом — расстыковка не короче RECONN_MS, как на
   странице. Само переключение уходит фону сразу, не после паузы: попап
   закрывается от любого клика снаружи, и отложенная команда пропала бы
   вместе с окном, а селектор уже показывал бы новый прокси. Удерживается
   только картинка — «Подключение…» и комплект согласования стоят минимум
   RECONN_MS; ответил фон дольше — дольше (этап 6 добавит проверку при
   подключении). Новый выбор во время удержания перезапускает его; тост
   «Подключено: …» — когда закончились и ответ, и удержание. Включение из
   «выключено» не меняется: коннектор и так едет от базы к гнезду */
const RECONN_MS = 620;   /* 4.2: как расстыковка на странице */
function endReconn(){ clearTimeout(reconnT); reconn = false; reconnMsg = null; }   /* 4.2 */
/* удержание картинки расстыковки; отложенный тост — когда закончились и
   удержание, и проверка при подключении (7В). Зовут reconnect() (смена по
   клику) и подписка (переключение, сделанное фоном при обрыве, 7В) */
function holdReconn(){
  clearTimeout(reconnT);
  reconn = true;
  reconnT = setTimeout(() => {
    reconn = false;
    renderPower();
    if(reconnMsg && st.enabled && !probing()){ toast(reconnMsg); reconnMsg = null; }   /* 7В: проверка ещё идёт — тост ждёт её */
  }, RECONN_MS);
}
function reconnect(id, doneMsg){   /* 4.2 */
  reconnMsg = null;
  holdReconn();
  connect(id, doneMsg);
}
/* 7В: проверка при подключении закончилась (state.probing снят при
   включённом прокси). Ошибку уже объявил noteLastError — отложенный тост
   «Подключено» тогда не нужен; результат без кода («не прошла» при живом
   прокси) на экран не выходит — только в диагностику страницы (решение
   человека 11.09, В4-а) */
function probeDone(){
  if(!st.enabled) return;
  if(st.lastError){ reconnMsg = null; return; }
  if(reconnMsg && !reconn){ toast(reconnMsg); reconnMsg = null; }
}
$('#btnPower').addEventListener('click', async () => {
  if(busy || reconn) return;   /* 4.2: во время удержания питание не трогаем, как на странице */
  if(st.enabled){
    /* этап 4: выключение — сообщение фону; выбор при этом сохраняется */
    heroErr = null; connGen++;
    clearTimeout(heroErrT);
    const res = await send({ cmd:'disable' });
    await refreshState();
    renderPower(); renderSel();
    if(!res.ok) toast(errText('noAnswer'), true);
    return;
  }
  const p = active();
  if(!p){ toast(msg('pickFirst'), true); return; }
  connect(p.id);
});

/* ── тема: контрол v187, привязан к окну попапа ── */
const THM_SUN = iconSun(20), THM_MOON = iconMoon(20);   /* 3Б.6: из icons.js, размер как в прототипе; на странице те же значки 19×19 */
/* 3Б.2: атрибут темы на <html> (решение 07.09), в прототипе был на .pop;
   класс .theming, гасящий переходы, остаётся на окне */
/* этап 4: кнопка только пишет settings.theme; окно перекрашивает
   applyTheme() по подписке — тем же путём, что и при смене темы на
   странице. До первой отрисовки атрибут ставит theme.js по параметру
   адреса, который фону даёт chrome.action.setPopup. */
$('#btnTheme').addEventListener('click', () => {
  const toLight = document.documentElement.dataset.theme !== 'light';
  state.patchSettings({ theme: toLight ? 'light' : 'dark' }).catch(err => {
    console.error('[pxs] не удалось записать тему:', err);
    toast(msg('errStorage'), true);
  });
});
function applyTheme(theme){
  const light = theme === 'light';
  pop.classList.add('theming');
  if(light) document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  const b = $('#btnTheme');
  b.innerHTML = light ? THM_MOON : THM_SUN;
  b.title = light ? msg('themeToDark') : msg('themeToLight');
  b.setAttribute('aria-pressed', String(light));
  renderSel();                                   /* палитра заметок следует за темой */
  if(!$('#pMenu').hidden) renderMenu();
  requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.remove('theming')));
}

/* ── смена языка: глобус в шапке, выбор перерисовывает окно ──
   3Б.2: блока нет — решение 07.09 при проверке. Язык расширения задаёт
   браузер: chrome.i18n переключать на лету нечем, и отдельной кнопки по
   плану нет. В прототипе здесь стояли closeLang(), setLang() и три
   обработчика (#btnLang, #langMenu, pointerdown); снимать их там же. */

/* ── настройки: этап 4 — страница расширения, раздел «Настройки»
   (был тост openSettings). Не openOptionsPage: он не передаёт параметр
   темы, решение 08.09 ── */
$('#btnGear').addEventListener('click', () => openPage({ go:'settings' }));

/* ── ПРОВЕРКА IP (2.5.1) ─────────────────────────────────────────────
   Вопрос человека «а прокси правда работает?» решается одним запросом:
   спрашиваем сервис, какой адрес он видит. Идёт этот запрос через
   текущее соединение браузера, поэтому при включённом прокси ответ —
   адрес прокси, при выключенном — свой. Флаг страны берём из того же
   списка, что и строки (по адресу, если он там есть). */
const IP_SERVICES = ['https://ipwho.is/?fields=success,ip,country_code,city', 'https://api.ipify.org?format=json'];
let ipBusy = false;

async function checkIp(){
  if(ipBusy) return;
  ipBusy = true;
  const box = $('#chkIp'), out = $('#ckOut'), btn = $('#btnChkIp'), lbl = $('#ckBtnT');
  box.dataset.state = 'busy';
  btn.disabled = true;
  lbl.textContent = msg('chkIpBusy');
  out.textContent = '';
  let got = null;
  for(const url of IP_SERVICES){
    try{
      const res = await fetch(url, { cache:'no-store', credentials:'omit' });
      if(!res.ok) continue;
      const j = await res.json();
      const ip = (j && (j.ip || j.query)) || '';
      if(/^[0-9a-fA-F:.]{3,45}$/.test(ip)){ got = { ip, cc: j.country_code || '' }; break; }
    }catch(err){ /* следующий сервис */ }
  }
  ipBusy = false;
  btn.disabled = false;
  lbl.textContent = msg('chkIpBtn');
  box.dataset.state = got ? 'done' : 'fail';
  if(!got){ out.textContent = msg('chkIpFail'); return; }
  const p = (proxies || []).find(x => x.ip === got.ip);
  const cc = (p && p.cc) || got.cc || '';
  /* подстановка в chrome.i18n — только массивом: строка разложилась бы на
     буквы и в текст попал бы сам «{ip}» */
  const line = st && st.enabled ? msg('chkIpVia', [got.ip]) : msg('chkIpDirect', [got.ip]);
  /* flag() отдаёт готовую разметку <i class="fl" …>, а не стиль — вставляем
     как есть; страна неизвестна — без флага (серый прямоугольник тут лишний) */
  out.innerHTML = (cc ? flag(cc) : '') + esc(line);
}

$('#btnChkIp').addEventListener('click', checkIp);

/* ── уведомления (7Г) ── */
/* иконка нового типа: скачивание — прокси не появились сами,
   их надо забрать из аккаунта */
const DL = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.2v7.2"/><path d="m4.9 6.6 3.1 3.1 3.1-3.1"/><path d="M2.6 11.4v1.2c0 .7.6 1.2 1.2 1.2h8.4c.7 0 1.2-.5 1.2-1.2v-1.2"/></svg>';
/* 3Б.2: крестик NX — теперь ICON_CLOSE из icons.js (копия в разметке у крестика плашки доменов снята 7Л вместе с плашкой) */
/* 7Г: четыре значка новых видов — в том же ключе, что DL: 15×15, штрих 1.5.
   Галочка в круге — самолечение («прокси снова работает»); круг с
   минусом — пропал из аккаунта; две стрелки — заменён; ключ — ключ API */
const N_OK   = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="m5.3 8.2 1.9 1.9 3.6-3.8"/></svg>';
const N_GONE = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M5.2 8h5.6"/></svg>';
const N_SWAP = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.6 5.4h10.8"/><path d="m10.4 2.4 3 3-3 3"/><path d="M13.4 10.6H2.6"/><path d="m5.6 7.6-3 3 3 3"/></svg>';
const N_KEY  = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.2" cy="10.8" r="3"/><path d="m7.4 8.6 6-6"/><path d="m10.6 5.4 1.8 1.8"/><path d="m12.4 3.6 1.4 1.4"/></svg>';
/* 7И: «!» в круге — значок info баннера файла сообщений (по образцу N_OK:
   15×15, штрих 1.5, круг r 6.2) */
const N_INFO = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.9v3.7"/><path d="M8 11.3h.01"/></svg>';
/* 7И: значок карточки баннера по полю icon файла (незнакомое разбор фона
   уже свёл к info) */
const BANNER_ICON = { info:N_INFO, warn:ICON_WARN, clock:ICON_CLOCK, ok:N_OK, key:N_KEY, download:DL };

/* 7Г: карточки считает notifs.js — одни правила с фоном; здесь только
   тексты, значки, цвет и действие по виду карточки.
   nid — устойчивый идентификатор: он же ключ в seen и dismissed,
   поэтому строится из смысла, а не из позиции в списке.
   7З: settings — область уведомлений о сроках (notifScope, notifWatch),
   те же, что читает фон для значка.
   7И: remote, version, lang — баннеры файла сообщений (те же, что у фона) */
const notifData = () => ({ proxies, account, state: st, notifs, settings, remote, version: VERSION, lang: uiLang, now: Date.now() });
/* карточки к показу — без закрытых */
const notifList = () => notifRules.list(notifData());
/* непрочитанные из них */
const unreadOf = cards => notifRules.unreadCards(cards, notifs, Date.now());
/* класс тона карточки (шаблоны — макет человека 22.09): красный — «Истекли»
   и обрыв (как у счётчика на значке), жёлтый — «Истекают», пропал, ключ не
   действует; нейтральный — без класса. 7И: сам тон решает notifs.js
   (toneOf — одна таблица с фоном; баннер — по уровню) */
const nClass = x => { const t = notifRules.toneOf(x); return t === 'info' ? '' : ' ' + t; };
/* 7З (макет 22.09): карточки-таблицы сроков раскрываются; раскрытие — память
   окна: при следующем открытии панели снова свёрнуты (ответ 22.09, 4).
   xpOpen — nid раскрытых карточек, rowOpen — ключи раскрытых строк */
const xpOpen = new Set();
/* строки заказов из нескольких адресов — тоже свёрнуты изначально (правка
   человека 22.09): ключ строки — nid карточки и номер заказа */
const rowOpen = new Set();
const isLevel = x => x.kind === 'badAll' || x.kind === 'warnAll';
const N_CHEV = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3.6 6.2 4.4 4.4 4.4-4.4"/></svg>';
/* подсказка крестика: сроки — на сутки, «новых» — до следующих новых,
   остальное — навсегда (ключ nClose, решение 17.09) */
const nHideTitle = k => notifRules.snoozes(k) ? msg('nHideDay') : k === 'new' ? msg('nHide') : msg('nClose');
/* срок строки таблицы — коротко, без слова «истёк»: оно в шапке карточки
   (макет 22.09, ответ на вопрос о месте в строке) */
function whenShort(d){
  if(d < -1) return msgN('nAgo', -d);
  if(d === -1) return msg('nAgoYesterday');
  if(d === 0) return msg('nToday');
  if(d === 1) return msg('nTomorrow');
  return msgN('nInDays', d);
}
/* счёт в шапке таблицы: «N заказов · M прокси» — рядом с заголовком; ближайший
   срок у «Истекают» — строкой ниже (вместе с заголовком в одну строку при
   полном наборе цифр не помещается); сам срок красится по своей срочности
   (правка человека 22.09): в текст ключа подставляется метка, попап меняет
   её на цветной кусок после экранирования. Метка — обычные знаки: нулевой
   символ переводчик строк браузера из подстановки выбрасывал, и срок
   пропадал (находка человека 23.09) */
const NEAR_HOLE = '[[near]]';
const OF_HOLE = '[[via]]';   /* 7К.2 (Г-4): метка «N из M» — из обычных знаков, как NEAR_HOLE, не \u0001 */
const levelCount = x => [msgN('nLevelOrders', x.orders.length), msgN('nLevelProxies', x.n)].join(' · ');   /* 7К.2 (Ж-3): формы числа у прокси, как у заказов */
/* тексты и действие карточки по виду; act — что делает кнопка:
   'show' — экран выбора из аккаунта, 'key' — базовая вкладка настроек
   (блок «Аккаунт»), 'open' — адрес баннера (7И), без act — кнопки нет;
   'renew' (кабинет proxys.io) — только у кнопки .n-cta внизу раскрытой
   таблицы сроков, не у карточки (7К.2, уборка Г-5);
   arrow — стрелка в кнопке (у «Настройки» её нет — макет 22.09).
   7З: 'badAll' / 'warnAll' — карточки-таблицы сроков: заголовок цветной,
   своей кнопки в шапке нет, «Продлить в кабинете» — внизу раскрытой */
function notifView(x){
  switch(x.kind){
    case 'badAll':   return { ico:ICON_WARN,  t:msg('nLevelExpiredT'), c:levelCount(x), s:'' };
    case 'warnAll':  return { ico:ICON_CLOCK, t:msg('nLevelSoonT'), c:levelCount(x), s:msg('nLevelNearest', [NEAR_HOLE]), near:whenShort(x.d), nearTone:x.d <= EXP_BAD_DAYS ? 'bad' : 'warn' };
    case 'new':      return { ico:DL,         t:msgN('nNewT', x.n), s:msg('nNewS'), act:'show', al:msg('show'), arrow:true };
    case 'lost':     return { ico:ICON_WARN,  t:msg('nLostT', [x.ip]), s:x.newIp ? msg('nLostS', [x.newIp]) : msg('nLostNoneS') };
    /* 2.6: у события лечения протокола есть поле type — карточка говорит,
       какая схема нашлась; у лечения пароля поля нет, тексты прежние */
    case 'healed':   return x.type
                       ? { ico:N_OK, t:msg('nHealedTypeT', [x.ip]), s:msg('nHealedTypeS', [x.type]) }
                       : { ico:N_OK, t:msg('nHealedT', [x.ip]), s:msg('nHealedS') };
    case 'gone':     return { ico:N_GONE,     t:msg('nGoneT', [x.ip]), s:msg('nGoneS') };
    case 'replaced': return { ico:N_SWAP,     t:msg('nReplacedT', [x.ip, x.newIp]), s:msg('nReplacedS'), act:'show', al:msg('show'), arrow:true };
    /* 7И (правка человека 24.09): 'empty' — по ключу заказов не найдено; та же причина, что на странице (kErrEmpty) */
    case 'key':      return x.error === 'empty'
                       ? { ico:N_KEY, t:msg('nKeyEmptyT'), s:msg('kErrEmpty'), act:'key', al:msg('navSettings'), arrow:false }
                       : { ico:N_KEY, t:msg('nKeyT'), s:msg('nKeyS'), act:'key', al:msg('navSettings'), arrow:false };
    /* 7И: баннер файла сообщений — тексты ИЗ ФАЙЛА (cardHtml экранирует их
       через esc(), как все); кнопка есть только вместе с адресом, стрелка как
       у «Показать»; уровень виден тоном карточки, подписи уровня нет */
    case 'banner':   return { ico:Object.hasOwn(BANNER_ICON, x.icon) ? BANNER_ICON[x.icon] : N_INFO, t:x.title, s:x.body, ...(x.url ? { act:'open', al:x.button, arrow:true } : {}) };   /* 7К.2 (Г-3): только своё поле — не из прототипа объекта */
    default:         return { ico:ICON_WARN,  t:x.nid, s:'' };
  }
}
/* записать метки: только seen и dismissed, без nid, которых нет среди
   карточек (иначе карты росли бы вечно); события фон пишет сам. Копия
   меняется сразу, подписка потом принесёт то же значение */
function writeNotifs(seen, dismissed){
  const all = notifRules.all(notifData());
  const next = { ...notifs, seen: notifRules.prune(seen, all), dismissed: notifRules.prune(dismissed, all) };
  notifs = next;
  state.setNotifs({ seen: next.seen, dismissed: next.dismissed }).catch(err => {
    console.error('[pxs] не удалось записать метки уведомлений:', err);
    toast(msg('errStorage'), true);
  });
}
/* закрыть карточки: сроки — на сутки, остальное — навсегда (правило в notifs.js) */
function dismissNotifs(nids){
  const now = Date.now(), dismissed = { ...notifs.dismissed };
  nids.forEach(nid => { dismissed[nid] = now; });
  writeNotifs(notifs.seen, dismissed);
}
/* панель открыта — показанные карточки прочитаны: число на значке и
   колокольчике гаснет, карточки остаются. Пишется только когда есть что
   пометить: своё эхо из хранилища сюда же приходит, и без этой проверки
   попап ходил бы по кругу */
function markSeen(cards){
  const fresh = unreadOf(cards);
  if(!fresh.length) return;
  const now = Date.now(), seen = { ...notifs.seen };
  fresh.forEach(x => { seen[x.nid] = now; });
  writeNotifs(seen, notifs.dismissed);
  renderBadge();   /* число на колокольчике гаснет сразу, эхо из хранилища его не перерисует — копия уже та же */
}
function renderBadge(){
  const n = notifList();
  const bell = $('#btnNotif'), bdg = $('#bdg');
  if(!n.length){ bell.disabled = true; bdg.hidden = true; bell.setAttribute('aria-label', msg('notifT')); $('#bellIco').innerHTML = BELL_OFF; return; }
  bell.disabled = false;
  $('#bellIco').innerHTML = BELL_ON;
  /* 7Г: число — непрочитанные, то же, что на значке; список не пуст, а
     непрочитанных нет — колокольчик активен без числа */
  const fresh = unreadOf(n);
  bdg.hidden = !fresh.length;
  bdg.textContent = fresh.length;
  /* этап 9 (проход Г, п. 3): число непрочитанных — в имени кнопки: aria-label
     перекрывает содержимое, и само число (#bdg, aria-hidden) диктор не читал бы */
  bell.setAttribute('aria-label', fresh.length ? `${msg('notifT')}: ${fresh.length}` : msg('notifT'));
  /* 7И (решение человека 23.09): цвет числа — по сильнейшему тону непрочитанных,
     тот же tone(), что у плашки значка в фоне: красный — покой без класса,
     жёлтый — .warn, нейтральный — .info (тёмное число по токенам темы) */
  const tone = notifRules.tone(fresh);
  bdg.classList.toggle('warn', tone === 'warn');
  bdg.classList.toggle('info', tone === 'info');
}
/* строка таблицы сроков (7З, макет 22.09 и правки человека по живому попапу):
   сверху плашка «№заказа», флаг страны и срок справа; ниже — адреса, каждый
   своей плашкой во всю ширину с стрелкой в конце: у прокси из списка стрелка
   ведёт к его строке на странице (как шестерёнка в селекторе — go:'proxy'),
   у адреса только из аккаунта — подпись «не добавлен» и стрелка на экран
   выбора из аккаунта (go:'acc'). Заказ из нескольких адресов свёрнут: в
   шапке строки счёт «N прокси» и стрелка, щелчок по шапке раскрывает плашки
   (память окна); один адрес — плашка видна всегда */
function rowHtml(x, o){
  const first = o.ips[0];
  const red = o.d <= EXP_BAD_DAYS;   /* правка человека 22.09, 2: два дня и меньше — красный, как чип срока */
  const many = o.n > 1;
  const key = `${x.nid}|${o.orderId === null ? first.ip + ':' + first.port : o.orderId}`;
  const open = !many || rowOpen.has(key);
  const plates = o.ips.map(a => a.id
    ? `<button class="n-ipb" data-goto="${esc(a.id)}" title="${esc(msg('openThisExt'))}"><span class="n-ip">${esc(a.ip)}</span>${ICON_ARROW}</button>`
    : `<button class="n-ipb acc" data-goacc title="${esc(msg('nNotAddedTip'))}"><span class="n-ip">${esc(a.ip)}</span><i>${esc(msg('nNotAdded'))}</i>${ICON_ARROW}</button>`).join('');
  const head = `<span class="n-ord">${o.orderId === null ? '' : '№' + esc(String(o.orderId))}</span>${first.cc ? flag(first.cc) : ''}${many ? `<span class="n-cnt">${esc(msgN('nLevelProxies', o.n))}</span>` : ''}<span class="n-when${red ? ' bad' : ' warn'}">${esc(whenShort(o.d))}</span>`;
  return `
    <div class="n-row${open ? ' open' : ''}">
      ${many
        ? `<button class="n-rh" data-row="${esc(key)}" aria-expanded="${open}" title="${esc(msg(open ? 'nCollapse' : 'nExpand'))}">${head}<span class="n-x" aria-hidden="true">${N_CHEV}</span></button>`
        : `<div class="n-rh">${head}</div>`}
      ${open ? `<div class="n-ips">${plates}</div>` : ''}
    </div>`;
}
/* одна карточка. Таблицы сроков (badAll / warnAll) — раскрывающиеся: шапка
   — кнопка со значком, заголовком, подписью и стрелкой в правом нижнем углу;
   крестик — отдельно, поверх правого верхнего угла (под ним стрелка), на
   сутки для уровня; наведение на крестик стрелку не трогает — она внутри
   кнопки-заголовка, а крестик снаружи. Щелчок по шапке раскрывает строки и
   кнопку «Продлить в кабинете» */
function cardHtml(x){
  const v = notifView(x), lv = isLevel(x), open = lv && xpOpen.has(x.nid);
  /* 7И (правка человека 24.09): у sticky-баннера крестика нет — уйдёт вместе с сообщением из файла */
  const cross = notifRules.closable(x) ? `<button class="nx" data-nx="${esc(x.nid)}" title="${esc(nHideTitle(x.kind))}" aria-label="${esc(nHideTitle(x.kind))}">${ICON_CLOSE}</button>` : '';
  /* шапка таблицы: заголовок и счёт «заказы · прокси» одной строкой (счёт
     серый, при нехватке места — многоточие, в крестик не упирается), под
     ней — ближайший срок у «Истекают»; стрелка в углу под крестиком */
  if(lv) return `
    <div class="ncard lvl${nClass(x)}${open ? ' open' : ''}" data-xp="${esc(x.nid)}">
      <button class="n-lv" data-lvtoggle aria-expanded="${open}" title="${esc(msg(open ? 'nCollapse' : 'nExpand'))}"><span class="n-i">${v.ico}</span><span class="n-t">${esc(v.t)}<span class="n-c">${esc(v.c)}</span></span>${v.s ? `<span class="n-s">${esc(v.s).replace(NEAR_HOLE, `<b class="n-near ${v.nearTone}">${esc(v.near)}</b>`)}</span>` : ''}<span class="n-x" aria-hidden="true">${N_CHEV}</span></button>
      ${cross}
      ${open ? `<div class="n-tbl">${x.orders.map(o => rowHtml(x, o)).join('')}<button class="n-cta" data-nact="renew" data-nid="${esc(x.nid)}">${esc(msg('nRenewCabinet'))}${ICON_ARROW}</button></div>` : ''}
    </div>`;
  return `
    <div class="ncard${nClass(x)}">
      <span class="n-i">${v.ico}</span>
      <span class="n-t">${esc(v.t)}</span>
      ${cross}
      <span class="n-s">${esc(v.s)}</span>
      ${v.act ? `<span class="n-a"><button class="nact" data-nact="${v.act}" data-nid="${esc(x.nid)}">${esc(v.al)}${v.arrow ? ICON_ARROW : ''}</button></span>` : ''}
    </div>`;
}
function renderNotifs(){
  const n = notifList();
  $('#nClear').disabled = !n.some(notifRules.closable);   /* 7И: одни sticky-баннеры — закрывать нечего */
  $('#nList').innerHTML = n.length ? n.map(cardHtml).join('')
  : `<div class="n-empty">
      <svg width="26" height="26" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 13.3c-.9-1-1.4-2.4-1.4-3.8V8a4.2 4.2 0 0 0-8.4 0v1.5c0 1.4-.5 2.8-1.4 3.8l-.7.8h12.6z"/><path d="M8.4 16.2a1.7 1.7 0 0 0 3.2 0"/></svg>
      ${msg('nEmpty')}</div>`;
  /* 7Г: показано в открытой панели — прочитано (метка seen, не dismissed) */
  if($('#notif').classList.contains('open')) markSeen(n);
}
function openNotif(open){
  $('#notif').classList.toggle('open', open);
  $('#notif').setAttribute('aria-hidden', String(!open));
  if(open){ xpOpen.clear(); rowOpen.clear(); renderNotifs(); openMenu(false); closeSite(); $('#nBack').focus(); }   /* 7Ж: одна панель разом; 7З: таблицы и строки снова свёрнуты */
  else $('#btnNotif').focus();
}
$('#btnNotif').addEventListener('click', () => openNotif(true));
$('#nBack').addEventListener('click', () => openNotif(false));
$('#nClear').addEventListener('click', () => {
  /* «Закрыть всё» закрывает только то, что сейчас на экране:
     будущих уведомлений оно не касается — иначе кнопка
     превращается в «больше никогда не беспокоить».
     7И (правка человека 24.09): sticky-баннеры не закрываются — остаются
     в панели, панель тогда не закрывается и тоста нет: видно, что осталось */
  dismissNotifs(notifList().filter(notifRules.closable).map(x => x.nid));
  renderBadge();
  renderNotifs();
  if(notifList().length){ return; }
  openNotif(false);
  toast(msg('allClosed'));
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    hideTip();
    if($('#notif').classList.contains('open')) openNotif(false);
    else if(!$('#pick').hidden) closePick();   /* 7Л: Escape закрывает плашку выбора */
    else if(siteOpen()) openSite(false);   /* 7Ж: Escape закрывает панель сайта; 7Л — без вопроса */
    else openMenu(false);
  }
});
$('#nList').addEventListener('click', e => {
  const x = e.target.closest('[data-nx]');
  if(x){
    dismissNotifs([x.dataset.nx]);
    renderBadge(); renderNotifs();
    return;
  }
  /* 7З (макет 22.09): заголовок или стрелка таблицы — раскрыть / свернуть
     уровень; строка таблицы — раскрыть / свернуть её адреса; только вид,
     меток не пишет */
  const lvt = e.target.closest('[data-lvtoggle]');
  if(lvt){
    const nid = lvt.closest('[data-xp]').dataset.xp;
    xpOpen.has(nid) ? xpOpen.delete(nid) : xpOpen.add(nid);
    renderNotifs();
    return;
  }
  const row = e.target.closest('[data-row]');   /* шапка строки заказа из нескольких адресов — раскрыть / свернуть плашки */
  if(row){
    rowOpen.has(row.dataset.row) ? rowOpen.delete(row.dataset.row) : rowOpen.add(row.dataset.row);
    renderNotifs();
    return;
  }
  /* плашка адреса: прокси списка — его строка на странице (как шестерёнка в
     селекторе), адрес только из аккаунта — экран выбора из аккаунта */
  const go = e.target.closest('[data-goto]');
  if(go){ openPage({ go:'proxy', id: go.dataset.goto }); return; }
  if(e.target.closest('[data-goacc]')){ openPage({ go:'acc' }); return; }
  const b = e.target.closest('[data-nact]');
  if(!b) return;
  const n = notifList().find(y => y.nid === b.dataset.nid);
  if(!n) return;
  const act = b.dataset.nact;   /* «Продлить в кабинете» внизу таблицы — renew */
  /* 7Г (решение человека 15.09 по ответу разработчиков): «Продлить» ведёт
     в личный кабинет proxys.io — отдельного адреса продления нет, оно
     делается со страницы кабинета; корзина (urlCart) остаётся кнопке
     «Купить прокси» на странице. Ключ openRenew (тост-обещание 3Б.2)
     снят из словарей на 7К.2 (уборка) */
  if(act === 'renew') chrome.tabs.create({ url: siteUrl(msg('urlMy')) });   /* 7И: путь из словаря, хост — из файла сообщений */
  else if(act === 'show') openPage({ go:'acc' });   /* этап 4: экран выбора прокси из аккаунта на странице (был тост openAcc); 7Г: и «заменён» — страница сама отмечает новые адреса */
  else if(act === 'key') openPage({ go:'settings' });   /* 7Г: блок «Аккаунт» базовой вкладки, строка «ключ не действует» там уже есть */
  else if(act === 'open' && n.kind === 'banner' && n.url) chrome.tabs.create({ url: n.url });   /* 7И: кнопка баннера — адрес из карточки (https на хост сайта, проверен разбором фона), не из разметки */
});

/* ── селектор режима списков (7Л, решение человека 19.09) ──
   Вместо группы «иконка + тип + тумблер» — три положения «Выкл · Чёрный ·
   Белый» (#lstSeg, кнопки data-mode, radiogroup/radio). Селектор ТОЛЬКО
   выбирает режим — пишет settings.listMode и ничего не пишет в списки
   (В2): списки хранятся независимо, при «Выкл» ничего не стирается.
   Подписи — короткие «Выкл · Чёрн. · Бел.» (luOff / luBlackShort /
   luWhiteShort): с полными «Чёрный · Белый» селектор не оставлял места
   кнопке «Настройки» рядом (проверено в окне 340 px); title — полные */
/* 7Л (компоновка В2, правка человека 20.09): селектор во всю ширину — подписи
   полные (короткие luBlackShort/luWhiteShort остались странице настроек) */
const MODE_LABEL = { off: 'luOff', black: 'luBlack', white: 'luWhite' };   /* 7К.2 (уборка Г-6): одна строка на режим — подпись, title и aria-label одни */
const MODE_TOAST = { off: 'listsOff', black: 'listBlackOn', white: 'listWhiteOn' };
function renderSetrow(){
  $$('#lstSeg [data-mode]').forEach(b => {
    b.setAttribute('aria-checked', String(b.dataset.mode === settings.listMode));
    b.textContent = msg(MODE_LABEL[b.dataset.mode]);
    b.title = msg(MODE_LABEL[b.dataset.mode]);
    b.setAttribute('aria-label', msg(MODE_LABEL[b.dataset.mode]));
  });
  $('#bsT').textContent = msg('navSettings');
  renderSite();   /* 7Ж: строка сайта и панель следуют за списками */
}
/* записать поля списков — ОДИН помощник на строку сайта, панель и селектор
   режима (прежний writeSetting этапа 4 стал им в 7Ж): копия меняется сразу
   (тумблер не ждёт хранилища), подписка потом принесёт то же значение.
   7Л (В7): команды фону нет — он применяет списки заново по подписке на
   settings (idempotent, с keepError), вкладка не перезагружается никогда:
   правка списков — не смена прокси; хвоста tabReloaded у тостов списков
   не бывает. text пустой — тоста нет */
async function writeLists(patch, text){
  settings = { ...settings, ...patch };
  renderSetrow();
  try{ await state.patchSettings(patch); }
  catch(err){
    console.error('[pxs] не удалось записать настройку:', err);
    toast(msg('errStorage'), true);
    return false;
  }
  if(text) toast(text);
  return true;   /* правка 20.09 (8): тумблер строки по итогу записи просит фон перезагрузить вкладку */
}
$('#lstSeg').addEventListener('click', e => {
  const b = e.target.closest('[data-mode]');
  if(!b || !LIST_MODES.includes(b.dataset.mode) || b.dataset.mode === settings.listMode) return;
  writeLists({ listMode: b.dataset.mode }, msg(MODE_TOAST[b.dataset.mode]));
});

/* 3Б.2: стенд (standLen, applyState, standMark, scn и обработчик #stand)
   не перенесён — леса прототипа, в расширении окна рисует браузер */

/* ════════ 7Ж — ПРОКСИ ДЛЯ САЙТА ОТКРЫТОЙ ВКЛАДКИ (шаг 2′) ════════
   Строка «Прокси для:» над строкой «Списки» и панель «Адреса страницы». Против
   шага 2 (макет v27/v228, решения человека 18.09):
   · состояние коротко (stVia/stDirect/stPowerOff) + значок ⓘ с причиной
     (why*): длинные подписи не влезали (правка 1);
   · в плашке — T: правило на поддомен, если H накрыт именно им, иначе
     весь сайт S (правка 2);
   · счёт загрузки «N из M адресов» рядом с подписью, когда включён учёт
     запросов (settings.siteTrack) и есть данные: сколько адресов
     ответило без ошибок из всех; при сбоях текст жёлтый и значок «!» на
     плашке адреса, подсказка называет адрес и причину (правки 5, 8);
   · панель — одно дерево: корень S, разделы «Поддомены» и «Сторонние
     адреса», каждый сворачивается заголовком; при открытии панели оба
     свёрнуты, у свёрнутого раздела со сбоем — значок «!» (правки 3, 7);
   · причина сбоя — по коду ошибки браузера / ответу 5xx (reqErr);
   · siteRow выключен — строки нет; siteTrack выключен — счёта и сторонних
     адресов нет;
   · шаг 3 (сценарий 9): строки-исключения «!host» — coverage/listsFrom из
     parse.js отдают их вместе с правилами; накрытая правилом сайта ветка
     нажимаема и пишет «!ветка»; ветка под исключением — «через прокси —
     исключение» / «напрямую — исключение»; строка — короткое состояние и
     ⓘ «исключение «!$1» выводит адрес из правила «$2»»; T — самое точное
     правило или исключение; тумблер строки «в правило» снимает исключения,
     «из правила» — правила и исключения под сайтом без правила (мусор).
   Данные учёта запросов собирает фон (webRequest → ключ pageHosts во
   временной области); попап читает их сам (storage.sessionGet, как
   section) и следит за изменениями подпиской на session. Второго
   хранения списков нет — строка и панель правят те же settings.listMode /
   listBlack / listWhite, что и страница (7Л: правится поле выбранного
   режима — listField; при 'off' правки нет, тумблеры заперты).
   Обозначения: H — хост открытой вкладки; S — «весь сайт»; T — чем правит
   тумблер строки; R — самое точное правило, накрывающее H. */

/* вкладка: читается один раз при старте, после readAll. undefined — ещё
   не читали (строка не рисуется), null — вкладки нет или на ней не сайт */
let tabInfo = undefined;
let tabId = -1;
/* запись учёта запросов этой вкладки: { host: { n, fail, err, via, blocked } }
   или null (учёт выключен или данных нет). Читается из области session */
let pageRec = null;
/* 4-а: правило, снятое последним щелчком строки; при обратном щелчке
   пишется оно же, если ещё накрывает H, — иначе поддомен превратился бы в
   «весь сайт». Память окна */
let lastRule = null;
/* раскрытость разделов дерева — память окна; при каждом открытии панели
   сбрасывается в свёрнутое (решение 18.09, правка 3) */
let treeOpen = { subs:false, ext:false };

async function readTab(){
  let t = null;
  try{
    const tabs = await chrome.tabs.query({ active:true, currentWindow:true });
    t = Array.isArray(tabs) ? tabs[0] : null;
  }catch(err){ console.error('[pxs] не удалось прочитать активную вкладку:', err); }
  const url = t && typeof t.url === 'string' ? t.url : '';
  const host = tabHost(url);
  tabId = t && typeof t.id === 'number' ? t.id : -1;
  tabInfo = host ? { url, host } : null;
  await readPageRec();
}
/* запись учёта запросов вкладки — из временной области (фон её пишет при
   settings.siteTrack). Настройка выключена или вкладки нет — null */
async function readPageRec(){
  pageRec = null;
  if(tabId < 0 || settings.siteTrack !== true) return;
  try{
    const all = await storage.sessionGet(SESSION_KEYS.PAGE_HOSTS);
    pageRec = all && typeof all === 'object' && all[tabId] ? all[tabId] : null;
  }catch(err){ console.error('[pxs] не удалось прочитать учёт запросов:', err); }
}

/* значок сайта в слот: иконка из кэша браузера (адрес /_favicon/ с
   разрешением favicon — в сеть ничего не идёт), не загрузилась — глобус;
   без сайта — глобус сразу. Обработчик ошибки — addEventListener (CSP).
   7Л (шаг 2, п. 10): глобус перерисован ровным — круг, экватор,
   меридиан-эллипс, симметрично, 16×16, штрих 1.4; одна константа на
   строку и панель (siteIcon зовут обе) */
const GLOBE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4"/><ellipse cx="8" cy="8" rx="2.7" ry="6.2"/></svg>';
function siteIcon(slot){
  if(!slot) return;
  /* 7К.2 (Г-2): тот же адрес вкладки — значок в слоте не пересоздаём (иначе
     каждая перерисовка панели заново просила бы иконку у браузера) */
  const key = tabInfo ? tabInfo.url : '';
  if(slot.dataset.for === key && slot.firstChild) return;
  slot.dataset.for = key;
  if(!tabInfo){ slot.innerHTML = GLOBE; return; }
  const img = document.createElement('img');
  img.alt = '';
  img.addEventListener('error', () => { slot.innerHTML = GLOBE; });
  img.src = chrome.runtime.getURL('/_favicon/') + '?pageUrl=' + encodeURIComponent(tabInfo.url) + '&size=16';
  slot.replaceChildren(img);
}

/* ── модель: те же поля settings, что у страницы, без второго хранения ── */
const LIST_MAX = SETTINGS.listBlack.max;   /* предел поля, знаков (у обоих списков один) */
/* 7Л (шаг 2, п. 9): черновика панели больше нет (правка 7Ж 19.09 снята
   решением человека 19.09): тумблер строки, корень и ветки панели пишут в
   хранилище сразу — одна запись на щелчок, короткий тост; страница при
   этом не перезагружается никогда (В7), так что копить изменения незачем */
const lists = () => listsFrom(settings);     /* null — списки не действуют */
/* 7Л: поле выбранного списка (null при 'off') и его текст */
const activeField = () => listField(settings.listMode);
const activeText = () => { const f = activeField(); return f ? settings[f] : ''; };
/* выбранный список для ЗАПИСИ по тексту text (по умолчанию — поле как оно
   есть): действующий — правила и исключения; выбран, но без годных правил
   (пуст, мусор, одни исключения — В8) — пустые правила, исключения при этом
   читаются (normalizeDomains), чтобы «в правило» снимало накрывающее
   исключение; 'off' — null: писать некуда, тумблеры заперты. text нужен
   сторонним адресам (шаг 2): каждый следующий сайт правится по тексту,
   уже изменённому предыдущими, — одна запись на весь жест */
function editLists(text){
  const mode = settings.listMode;
  if(!listField(mode)) return null;
  return { listMode: mode, ...normalizeDomains(text === undefined ? activeText() : text) };
}
/* все правила списка, накрывающие хост, от точного к широкому */
function coveringRules(domains, host){
  const out = [];
  let rest = domains;
  while(true){
    const { rule } = coverage(rest, host);
    if(rule === null) return out;
    out.push(rule);
    rest = rest.filter(d => d !== rule);
  }
}

/* ── учёт запросов: список адресов вкладки и счёт загрузки ── */
/* адреса вкладки из записи учёта; null — учёт выключен или данных нет */
function hostsList(){
  if(settings.siteTrack !== true || !pageRec || !pageRec.hosts) return null;
  return Object.keys(pageRec.hosts).map(host => {
    const v = pageRec.hosts[host] || {};
    return { host, n:v.n||0, fail:v.fail||0, err:v.err||null, via:v.via, blocked:!!v.blocked };
  });
}
/* счёт загрузки: сколько адресов ответило без ошибок из всех. В счёте —
   адреса хотя бы с одним завершённым запросом; адрес, у которого все
   запросы не пустил блокировщик, в счёт не входит (ответа не было и это
   не про прокси, ответ Т7) — в дереве он с серой меткой */
const counted = r => r.n > 0;
const blockedOnly = r => r.blocked && r.n === 0;
function loadStats(){
  const res = hostsList();
  if(!res) return null;
  const real = res.filter(counted);
  const failed = real.filter(r => r.fail > 0);
  return { total: real.length, ok: real.length - failed.length, failed };
}
/* что произошло — по коду ошибки браузера или ответу сервера (Т7):
   HTTP 5xx через прокси — «прокси ответил $1», иначе «сервер ответил $1» */
const ERR_MAP = {
  ERR_TIMED_OUT:'errTimeout', ERR_CONNECTION_TIMED_OUT:'errTimeout',
  ERR_CONNECTION_RESET:'errReset', ERR_CONNECTION_CLOSED:'errReset', ERR_CONNECTION_ABORTED:'errReset',
  ERR_CONNECTION_REFUSED:'errRefused',
  ERR_NAME_NOT_RESOLVED:'errDns', ERR_NAME_RESOLUTION_FAILED:'errDns',
  ERR_INTERNET_DISCONNECTED:'errOffline',
  ERR_PROXY_CONNECTION_FAILED:'errProxy',
  ERR_TUNNEL_CONNECTION_FAILED:'errTunnel',
};
function reqErr(err, via){
  if(!err) return '';
  const h = /^HTTP (\d{3})$/.exec(err);
  if(h) return msg(via === true ? 'errHttpProxy' : 'errHttp', [h[1]]);
  const code = err.replace(/^net::/, '');
  if(ERR_MAP[code]) return msg(ERR_MAP[code]);
  if(/^ERR_CERT/.test(code)) return msg('errCert');
  return msg('errOther', [code]);
}
/* хвост подсказки про маршрут последнего запроса адреса (4-б) */
const routeTag = via => via === true ? ' · ' + msg('routeVia') : via === false ? ' · ' + msg('routeDirect') : '';
/* строка сбоя для подсказки: «адрес — причина · маршрут» */
const failLine = r => `${r.host} — ${reqErr(r.err, r.via)}${routeTag(r.via)}`;

/* состояние одного адреса — строке (H), корню (S) и строкам дерева.
   via — через прокси сейчас (правда о трафике: цвет плашки и короткое
   состояние); on — положение тумблера «прокси действует на сайт» (В1):
   при чёрном включён, пока адрес не в списке, при белом — пока в списке;
   расходится с via только у белого списка без правил (В8: списки не
   действуют, трафик через прокси, а тумблер выключен — сайта в списке
   нет); short — коротко; why — причина (ⓘ / под адресом в панели); off —
   тумблер недоступен ('off' — заперт включённым, В1); rule — самое точное
   правило, накрывающее адрес (исключения не в счёт); exc — исключение,
   если именно оно решает состояние адреса (шаг 3: точнее правила либо
   равной точности). 7Л: сценария 10 (единственное правило
   белого списка) и варианта 10б (сохранённый белый при выключенных) нет */
function siteState(host){
  if(!st.enabled) return { via:false, on:false, short: msg('stPowerOff'), why: msg('whyPower'), off:true, rule:null, exc:null };
  if(isSystemDirect(host)) return { via:false, on:false, short: msg('stDirect'), why: msg('whyLocal'), off:true, local:true, rule:null, exc:null };
  const mode = settings.listMode;
  /* 7Л (п. 7): при «Выкл» тумблер включён и заперт, подпись «списки выключены»,
     ⓘ — что делать (whyLists); щелчок по запертому — плашка выбора (п. 3) */
  if(mode === 'off') return { via:true, on:true, short: msg('stListsOff'), why: msg('whyLists'), off:true, pick:true, rule:null, exc:null };
  const l = lists();
  if(!l){
    /* В8: режим включён, а в выбранном списке нет годных правил — списки не
       действуют, весь трафик через прокси; тумблер — по правилу В1. Этап 9
       (правка человека 29.09): при пустом белом причины нет — строка «Белый
       список пуст…» не показывается нигде (ни в ⓘ, ни в корне панели), ⓘ
       говорит только, чем правит режим (строка режима в renderSite) */
    const black = mode === 'black';
    return { via:true, on:black, short: msg('stVia'), why: black ? msg('whyEmptyBlack') : '', rule:null, exc:null };
  }
  const cov = coveringRules(l.domains, host);
  const rule = cov[0] || null;
  const eff = coverage(l.domains, host, l.exceptions);
  const exc = eff.exception, listed = eff.rule !== null;
  const via = l.listMode === 'black' ? !listed : listed;
  /* причина: исключение называется, только когда оно выводит адрес из
     накрывающего правила; исключение без правила — обычное «не в списке» */
  const why = exc && rule
    ? msg(l.listMode === 'black' ? 'whyExcVia' : 'whyExcDirect', [exc, rule])
    : l.listMode === 'black'
      ? (listed ? msg('whyBlackIn', [rule]) : msg('whyBlackOut'))
      : (listed ? msg('whyWhiteIn', [rule]) : msg('whyWhiteOut'));
  return { via, on: via, short: via ? msg('stVia') : msg('stDirect'), why, rule, exc: exc && rule ? exc : null };
}
/* чем правит тумблер строки: самое точное правило ИЛИ исключение, накрывающее
   H, если оно точнее сайта; иначе весь сайт (правка 2, шаг 3) */
function rowTarget(host){
  const site = siteOf(host), k = siteState(host), t = k.exc || k.rule;
  return t && t !== site ? t : site;
}

/* ── ЗАПИСЬ — минимальная правка поля (промт 7Ж п. 7, шаг 3 п. 15) ──
   чужие строки, их порядок и написание не трогаются; новая строка — в конец,
   без «*.»; дубль не пишется; предел поля — тост listFull и ничего не
   пишется. Строки поля: правило → хост, исключение («!host») → хост после
   «!», прочее → null; сопоставление строк с правилами — тем же normalizeOne,
   что у разбора списка */
const EXC_RE = /^!\s*/;
const lineRule = raw => { const t = raw.trim(); return t && !EXC_RE.test(t) ? normalizeOne(t) : null; };
const lineExc  = raw => { const t = raw.trim(); if(!t || !EXC_RE.test(t)) return null; const r = t.replace(EXC_RE, ''); return r ? normalizeOne(r) : null; };
/* все исключения, накрывающие хост, от точного к широкому — как coveringRules */
function coveringExcs(exceptions, host){
  const out = [];
  let rest = exceptions;
  while(true){
    const { exception } = coverage([], host, rest);
    if(exception === null) return out;
    out.push(exception);
    rest = rest.filter(e => e !== exception);
  }
}
/* одна правка поля: снять строки-правила rmRules и строки-исключения rmExcs,
   дописать правило addRule либо исключение addExc. Возвращает { text, gone,
   added }; null — нечего менять; false — не влезло в предел (тост listFull).
   base — текст, который правим (по умолчанию поле выбранного списка как
   есть; сторонние адреса за сайтом правят текст, уже изменённый сайтом) */
function editLines({ rmRules = [], rmExcs = [], addRule = null, addExc = null, base }){
  const raw = (base === undefined ? activeText() : base).split('\n');   /* 7Л: поле выбранного списка */
  const drop = raw.map((r, i) => (rmRules.includes(lineRule(r)) || rmExcs.includes(lineExc(r))) ? i : -1).filter(i => i >= 0);
  const gone = drop.map(i => raw[i].trim());
  let added = null;
  if(addRule && !raw.some(r => lineRule(r) === addRule)) added = addRule;
  if(addExc && !raw.some(r => lineExc(r) === addExc)) added = '!' + addExc;
  if(!gone.length && !added) return null;
  let text = raw.filter((r, i) => !drop.includes(i)).join('\n');
  if(added) text = (text.trim() ? text.replace(/\s+$/, '') + '\n' : '') + added;
  if(text.length > LIST_MAX){ toast(msg('listFull'), true); return false; }
  return { text, gone, added };
}
/* записать правку в поле выбранного списка: тост с именами. 7Л (В10): годных
   правил не осталось — режим НЕ меняется, списки просто перестают
   действовать (строка скажет «через прокси» с причиной В8). Шаг 2 (п. 9):
   пишется сразу — и из строки, и из панели, черновика нет */
function commit(ed, via, what){
  writeLists({ [activeField()]: ed.text }, via ? msg('tVia', [what]) : msg('tBypass', [what]));
}
/* правило для записи в сторону «в список»: снятое последним щелчком строки,
   если оно ещё накрывает H (память обратного щелчка, 4-а), иначе T */
const rowDomain = host => (lastRule && coverage([lastRule], host).rule !== null) ? lastRule : rowTarget(host);

/* Один жест над одним адресом host в тексте base (поле выбранного списка):
   «В правило» (чёрный: напрямую, белый: через прокси) — снять исключения,
   накрывающие host, и дописать правило domain (T либо own), если ни одно
   правило host не накрывает. «Из правила» — снять все правила, накрывающие
   host, и исключения под сайтом, оставшиеся без правила (мусор).
   Возвращает правку editLines (null — нечего менять, false — не влезло) и
   имена для тоста: what — что дописано либо снятые строки через запятую */
function gesture(base, host, via, own){
  const l = editLists(base);
  if((l.listMode === 'black') === !via){
    const covered = coveringRules(l.domains, host).length > 0;
    const domain = covered ? null : (own || rowDomain(host));
    const ed = editLines({ rmExcs: coveringExcs(l.exceptions, host), addRule: domain, base });
    return { ed, what: domain || rowTarget(host), added: !!domain, rm: [] };
  }
  const rm = coveringRules(l.domains, host);
  if(!rm.length) return { ed: null, what: '', added: false, rm };
  const rest = l.domains.filter(d => !rm.includes(d)), site = siteOf(host);
  const orphan = l.exceptions.filter(e => (e === site || e.endsWith('.' + site)) && coverage(rest, e).rule === null);
  const ed = editLines({ rmRules: rm, rmExcs: orphan, base });
  return { ed, what: ed ? ed.gone.join(', ') : '', added: false, rm };
}

/* Сайты сторонних адресов страницы (шаг 2, п. 2 правил, В3): siteOf каждого
   хоста из учёта запросов, кроме локальных, сайта вкладки и его поддоменов;
   без учёта (мониторинг выключен или данных нет) — пустой список. Те же
   группы, что в разделе «Сторонние адреса» панели; хост, из которого
   правило не собрать (IPv6), пропускается */
function extSites(){
  const res = hostsList();
  if(!res || !tabInfo) return [];
  const site = siteOf(tabInfo.host), out = [];
  for(const r of res){
    const h = r.host;
    if(isSystemDirect(h) || h === site || h.endsWith('.' + site)) continue;
    const s2 = siteOf(h);
    if(normalizeOne(s2) !== s2 || out.includes(s2)) continue;
    out.push(s2);
  }
  return out;
}

/* Строка (host = H) и корень панели (host = S): цель — состояние host в
   ВЫБРАННОМ списке. 7Л: при 'off' писать некуда — тумблеры заперты, сюда не
   доходит (страховка — return); список без правил при включённом режиме —
   обычная запись первого правила (В8): автовключения чёрного нет, режим уже
   выбран человеком. Последнее правило снимается свободно — списки просто
   перестают действовать (сценарий 10 снят). own — что писать вместо T:
   ветка без правил пишет себя. withExt (шаг 2, В3) — только тумблер строки
   в окне: тот же жест применяется к сайтам сторонних адресов страницы —
   при чёрном «напрямую» дописывает их сайты, «через прокси» снимает их
   правила; при белом — зеркально; всё одной записью, тост «… и ещё N
   сайтов» (andMoreN) по числу сторонних сайтов, у которых что-то
   изменилось. Корень панели — только сайт (сторонние там по одному) */
function writeRow(host, via, own, withExt){
  if(!editLists()) return;                               /* 'off' — заперто */
  const g = gesture(undefined, host, via, own);
  if(g.ed === false) return;
  let text = g.ed ? g.ed.text : activeText(), changed = !!g.ed, n = 0;
  if(withExt){
    for(const s2 of extSites()){
      const e = gesture(text, s2, via, s2);
      if(e.ed === false) return;                         /* предел поля — ничего не пишем */
      if(!e.ed) continue;
      text = e.ed.text; changed = true; n += 1;
    }
  }
  if(!changed) return;
  const what = g.ed ? g.what : siteOf(host);
  const label = n ? msgN('andMoreN', n, [what]) : what;
  const done = writeLists({ [activeField()]: text }, via ? msg('tVia', [label]) : msg('tBypass', [label]));
  if(g.added) lastRule = null;
  else if(g.rm.length) lastRule = g.rm.length === 1 ? g.rm[0] : null;
  return done;   /* обещание записи (true — записано); ничего не менялось — undefined */
}

/* Ветка дерева (d ≠ S) правит только свою строку (п. 7), шаг 3 — и своё
   исключение (п. 15). «Из правила»: своё правило снимается; если после
   этого d всё ещё накрыт правилом шире — дописывается «!d». «В правило»:
   своё исключение снимается; под чужим исключением — дописывается своё
   правило d (оно точнее); уже накрыт правилом — менять нечего.
   7Л: список без правил — та же запись первого правила d; 'off' — заперто */
function writeBranch(d, via){
  const l = editLists();
  if(!l) return;                                         /* 'off' — заперто */
  const eff = coverage(l.domains, d, l.exceptions);
  const ownRule = l.domains.includes(d), ownExc = l.exceptions.includes(d);
  if((l.listMode === 'black') === !via){
    if(ownExc){ const ed = editLines({ rmExcs: [d] }); if(ed) commit(ed, via, d); return; }
    if(eff.rule !== null) return;                        /* уже в правиле */
    const ed = editLines({ addRule: d });                /* не накрыт либо под чужим исключением */
    if(ed) commit(ed, via, d);
    return;
  }
  const rest = ownRule ? l.domains.filter(x => x !== d) : l.domains;
  const stillCovered = coverage(rest, d, l.exceptions.filter(e => e !== d)).rule !== null;
  const ed = editLines({ rmRules: ownRule ? [d] : [], addExc: stillCovered ? d : null });
  if(ed) commit(ed, via, d);
}

/* ── строка в окне ──
   siteRow выключен — строки нет; nosite / power / local — тумблер
   недоступен; 'off' (7Л) — тумблер включён и заперт; обычное — счёт
   загрузки, короткое состояние + ⓘ, в плашке T. Плашка зеленеет по via
   (правда о трафике), тумблер стоит по on (В1) */
function renderSite(){
  if(tabInfo === undefined) return;   /* вкладка ещё не прочитана — старт */
  const row = $('#site'), sw = $('#stSw'), addr = $('#stAddr'), chip = $('#stLoad'), warn = $('#stWarn');
  row.hidden = settings.siteRow === false;
  if(settings.siteRow === false){ if(siteOpen()) openSite(false); closePick(); return; }
  if(!pickable()) closePick();   /* режим включили (селектором или в другом окне) — плашка выбора больше не нужна */
  if(!tabInfo){
    row.dataset.dim = 'nosite'; row.dataset.on = 'false';
    chip.textContent = ''; chip.className = 'st-load'; delete chip.dataset.tip;
    $('#stStateT').textContent = ''; $('#stState').classList.remove('on'); $('#stI').hidden = true;
    $('#stHost').textContent = msg('notSite'); addr.title = ''; warn.hidden = true; delete warn.dataset.tip;
    sw.disabled = true; sw.setAttribute('aria-checked', 'false'); sw.title = ''; $('#stEl').title = '';
    $('#stEl').classList.remove('lock'); delete $('#stEl').dataset.tip;
    if(siteOpen()) renderSitePanel();
    return;
  }
  const host = tabInfo.host, site = siteOf(host), k = siteState(host), target = rowTarget(host), on = st.enabled;
  row.dataset.dim = !on ? 'power' : k.local ? 'local' : 'no';
  row.dataset.on = String(k.via);
  /* счёт загрузки — только при включённом прокси и не на локальном адресе:
     что не загрузилось без прокси, к прокси отношения не имеет */
  const ls = on && !k.local ? loadStats() : null;
  if(ls && ls.total > 0){
    chip.textContent = String(ls.ok) + ' ' + msgN('loadedOf', ls.total);
    chip.classList.toggle('warn', ls.failed.length > 0);
    const tip = ls.failed.length
      ? msg('loadTipFail', [String(ls.total), String(ls.ok)]) + '\n' + ls.failed.map(failLine).join('\n')
      : msg('loadTipOk', [String(ls.total)]);
    chip.dataset.tip = tip;
    warn.hidden = ls.failed.length === 0;
    if(ls.failed.length) warn.dataset.tip = tip; else delete warn.dataset.tip;
  } else {
    chip.textContent = ''; chip.className = 'st-load'; delete chip.dataset.tip;
    warn.hidden = true; delete warn.dataset.tip;
  }
  $('#stStateT').textContent = k.short;
  $('#stState').classList.toggle('on', k.via);
  /* ⓘ строки (шаг 2, п. 12′; этап 9 — правка человека 29.09, короче): причина
     состояния (пустая при пустом белом списке — тогда строки нет); при
     действующем режиме — чем правит режим, одной строкой (описание работы
     списков осталось только в панели адресов), и, если сторонние адреса
     страницы неизвестны (мониторинг выключен или данных ещё нет), — откуда
     их взять. Строки — построчно; ⓘ виден, пока есть хоть одна */
  const why = k.why ? [k.why] : [];
  if(!k.off && !k.local){
    why.push(msg(settings.listMode === 'black' ? 'whyModeBlack' : 'whyModeWhite'));
    if(settings.siteTrack !== true) why.push(msg('whyNoExt'));
    else if(!hostsList()) why.push(msg('whyNoExtData'));
  }
  const i = $('#stI'); i.hidden = !why.length;
  if(why.length){ i.dataset.tip = why.join('\n'); i.setAttribute('aria-label', why.join(' ')); }
  else { delete i.dataset.tip; i.removeAttribute('aria-label'); }
  $('#stHost').innerHTML = target === site ? esc(target)
    : `<b>${esc(target.slice(0, target.length - site.length - 1))}</b><s>.${esc(site)}</s>`;
  /* по наведению — точный адрес вкладки (первой строкой) и назначение плашки */
  addr.title = (host !== target ? host + '\n' : '') + (k.local ? '' : msg('scopeTip'));
  sw.disabled = k.off === true;
  sw.setAttribute('aria-checked', String(k.on));
  /* 7Л (правка человека 20.09, 1): запертый при «Выкл» тумблер живой — обёртке
     класс lock (курсор, подсветка) и подсказка «нажмите, чтобы включить» */
  const lock = k.pick === true;
  $('#stEl').classList.toggle('lock', lock);
  if(lock) $('#stEl').dataset.tip = msg('lockTip'); else delete $('#stEl').dataset.tip;
  if(siteOpen()) renderSitePanel();
}
$('#stSw').addEventListener('click', () => {
  const sw = $('#stSw');
  if(!tabInfo || sw.disabled) return;
  const host = tabInfo.host;
  const done = writeRow(host, sw.getAttribute('aria-checked') !== 'true', null, true);   /* цель — противоположное положение: пишется T (или снятое ранее правило); снимается всё, что накрывает H; сторонние адреса — за сайтом (шаг 2) */
  /* 7Л (правка человека 20.09, 8): ТОЛЬКО тумблер строки — после записи списка,
     если включён тумблер «Перезагружать страницу» (settings.reload), фон
     применяет списки и перезагружает активную вкладку (команда siteReload;
     решение фона — по своему чтению настройки). Панель адресов и селектор
     режима вкладку не трогают (В7) */
  if(done && settings.reload === true) done.then(ok => { if(ok) send({ cmd:'siteReload' }); });
});
$('#stAddr').addEventListener('click', () => {
  if(!tabInfo || !st.enabled || isSystemDirect(tabInfo.host)) return;
  openSite(true);
});
/* щелчок по запертому тумблеру (сам он disabled — событие ловит обёртка) или
   по свободному месту строки: прокси выключен — тост; списки выключены —
   плашка выбора (шаг 2, п. 3); плашка адреса и ⓘ — свои обработчики */
const pickable = () => !!tabInfo && st.enabled && settings.listMode === 'off' && !isSystemDirect(tabInfo.host);
$('#site').addEventListener('click', e => {
  if($('#site').dataset.dim === 'power'){ toast(msg('powerFirst'), true); return; }
  if(e.target.closest('#stAddr') || e.target.closest('#stI') || e.target.closest('#stLoad') || e.target.closest('#stWarn')) return;
  if(pickable()) openPick();
});

/* ── плашка выбора списка (7Л, шаг 2, п. 3 правил; В5) ──
   При «Выкл» тумблеры заперты; щелчок по ним показывает плашку «Списки
   выключены. Включить: [Чёрный] [Белый] ×» на месте строк «Списки» и
   «Настройки» (вид — правка человека 20.09). Выбор ТОЛЬКО включает режим
   (listMode) — то же, что селектор; в списки ничего не пишется, тумблер
   оживает, и человек нажимает его сам. Крестик и Escape — ничего */
function openPick(){
  if(!pickable()){ closePick(); return; }
  const pick = $('#pick');
  pick.style.top = $('#lists').offsetTop + 'px';   /* колодец на месте строк «Списки» и «Настройки»; низ — поле окна (CSS) */
  hideTip();   /* пузырь запертого тумблера (lockTip) висел бы над плашкой */
  pick.hidden = false;
  pick.focus();   /* фокус на плашке, не на кнопке: без двойной обводки (правка человека 20.09) */
}
function closePick(){ $('#pick').hidden = true; }
$('#pick').addEventListener('click', e => {
  const b = e.target.closest('[data-pick]');
  if(b){
    closePick();
    if(settings.listMode === b.dataset.pick) return;
    writeLists({ listMode: b.dataset.pick }, msg(MODE_TOAST[b.dataset.pick]));
    $('#stSw').focus();
    return;
  }
  if(e.target.closest('#pickCancel')) closePick();
});

/* ── панель сайта: поверх окна, как панель уведомлений ── */
const siteOpen = () => $('#sitePanel').classList.contains('open');
function closeSite(){
  $('#sitePanel').classList.remove('open');
  $('#sitePanel').setAttribute('aria-hidden', 'true');
}
/* 7Л (шаг 2, п. 9): «Назад» и Escape просто закрывают — черновика и вопроса
   «Выйти/Остаться» больше нет */
function openSite(open){
  const p = $('#sitePanel');
  p.classList.toggle('open', open);
  p.setAttribute('aria-hidden', String(!open));
  if(open){
    treeOpen = { subs:false, ext:false };   /* при каждом открытии — свёрнуто (правка 3) */
    renderSitePanel(); openMenu(false);
    $('#notif').classList.remove('open'); $('#notif').setAttribute('aria-hidden', 'true');
    $('#spBack').focus();
  } else { renderSite(); $('#stAddr').focus(); }
}
const SUB_I = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 2.8v5.4a2.8 2.8 0 0 0 2.8 2.8h6.8"/><path d="m10 7.6 3.4 3.4L10 14.4"/></svg>';
const EXT_I = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.6 9.4a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1"/><path d="M9.4 6.6a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1"/></svg>';
const CHEV_I = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3.6 6.2 4.4 4.4 4.4-4.4"/></svg>';
const WARN_I = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.2 14.6 13.4H1.4z"/><path d="M8 6.4v3"/><path d="M8 11.6h.01"/></svg>';
const INFO_I = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4"/><path d="M8 4.9h.01"/></svg>';
/* тумблер строки дерева: .sw, положение — on (В1: включён = прокси действует
   на адрес; при белом списке без правил — выключен); d — чей адрес */
function spSw(d, k){
  const off = k.off === true;   /* шаг 3: накрытая правилом шире ветка нажимаема — пишет исключение; 7Л: при 'off' заперт, как строка */
  /* 7Л (правка человека 20.09, 1): при «Выкл» обёртка запертого тумблера живая —
     класс lock (курсор, подсветка) и подсказка «нажмите, чтобы включить» */
  const lock = off && k.pick === true;
  const t = lock ? ` data-tip="${esc(msg('lockTip'))}"` : off && k.why ? ` data-tip="${esc(k.why)}"` : '';
  return `<div class="sp-el${lock ? ' lock' : ''}" data-d="${esc(d)}"${t}><button class="sw" role="switch" aria-checked="${k.on}" aria-label="${esc(msg('siteAria'))}" data-act="toggle"${off ? ' disabled' : ''}></button></div>`;
}
/* файлы/запросы и сбой строки дерева: по хосту (поддомен) либо по всем
   хостам сайта (сторонний). Заблокированные — серой меткой, в счёт не идут */
function loadLine(rows, site){
  const real = rows.filter(counted);
  const blocked = rows.filter(blockedOnly);
  const n = real.reduce((a, r) => a + r.n, 0), fail = real.filter(r => r.fail > 0);
  let html = '';
  /* 7Л, шаг 3: плашка «N запросов» — кнопка на страницу запросов: одна строка
     (корень, поддомен, сторонний сайт с одним хостом) — по хосту, группа из
     нескольких хостов — по сайту (все хосты с siteOf(host) === site) */
  if(n){
    const q = rows.length === 1 ? `data-rq="${esc(rows[0].host)}"` : `data-rqsite="${esc(site)}"`;
    html += `<button class="sp-tag sp-rq" ${q} title="${esc(msg('rqOpen'))}">${esc(msgN('requests', n))}</button>`;
  }
  if(blocked.length) html += `<span class="sp-tag blk">${esc(msg('tagBlocked'))}</span>`;
  if(fail.length){
    const allFail = fail.length === real.length && fail.every(r => r.fail === r.n);
    const what = [...new Set(fail.map(r => reqErr(r.err, r.via)))].join('; ');
    const tip = fail.map(r => msg('failTip', [r.host, String(r.fail), String(r.n), reqErr(r.err, r.via)]) + routeTag(r.via)).join('\n');
    html += `<span class="sp-tag fail" data-tip="${esc(tip)}">${esc(allFail ? msg('failAll') : msg('failPart'))} · ${esc(what)}</span>`;
  }
  return html;
}
const secFails = rows => rows.filter(r => counted(r) && r.fail > 0).length;
const secFailLines = rows => rows.filter(r => counted(r) && r.fail > 0).map(failLine).join('\n');
/* содержимое панели: корень S, раздел «Поддомены», раздел «Сторонние адреса» */
function renderSitePanel(){
  const listEl = $('#spList');
  if(!tabInfo){ listEl.innerHTML = ''; $('#spMode').textContent = ''; return; }
  const host = tabInfo.host, site = siteOf(host), on = st.enabled;
  const l = lists(), domains = l ? l.domains : [], exceptions = l ? l.exceptions : [];
  const res = on ? hostsList() : null;   /* null — счёт выключен или данных нет */
  const byHost = new Map((res || []).map(r => [r.host, r]));
  /* covered — накрыт правилом шире, не своим (подпись asSite / coveredBy;
     с шага 3 нажимаем — щелчок пишет «!адрес»); excepted — состояние задано
     исключением (подпись stViaExc / stDirectExc) */
  const view = d => {
    const k = siteState(d);
    const eff = coverage(domains, d, exceptions);
    const covered = eff.rule !== null && eff.rule !== d;
    const excepted = k.exc !== null;
    return { ...k, cov: eff.rule, covered, excepted, cls: covered ? ' covered' : k.via ? ' on' : '' };
  };
  const focused = document.activeElement && document.activeElement.closest ? document.activeElement.closest('#spList .sp-el') : null;
  const focusedD = focused ? focused.dataset.d : null;
  /* корень */
  const r = view(site);
  const rootRow = byHost.get(site);
  let html = `<div class="sp-site"><div class="sp-root${r.cls}">
      <span class="sp-ico"></span>
      <div class="sp-host">${esc(site)}</div>
      <div class="sp-st">${esc(r.covered ? msg('coveredBy', [r.cov]) : r.short)}</div>
      <div class="sp-why">${esc(r.covered ? '' : (r.why || ''))}</div>
      ${spSw(site, r)}
    </div>${rootRow ? `<div class="sp-rootload">${loadLine([rootRow])}</div>` : ''}</div>`;
  /* поддомены: вкладка, правила под S, хосты загрузки под S */
  const kids = new Set();
  if(host !== site) kids.add(host);
  domains.forEach(x => { if(x !== site && !isIPHost(x) && x.endsWith('.' + site)) kids.add(x); });
  exceptions.forEach(x => { if(x !== site && x.endsWith('.' + site)) kids.add(x); });   /* шаг 3: строки-исключения под S — тоже ветки */
  byHost.forEach((_, h) => { if(h !== site && h.endsWith('.' + site)) kids.add(h); });
  const subs = [...kids].sort((a, b) => (a === host ? 0 : 1) - (b === host ? 0 : 1) || a.localeCompare(b));
  if(subs.length){
    const rows = subs.map(h => byHost.get(h)).filter(Boolean);
    const fails = secFails(rows), viaN = subs.filter(h => view(h).via).length;
    html += secHead('subs', msg('secSubs'), subs.length, viaN, fails, secFailLines(rows));
    if(treeOpen.subs) html += `<div class="sp-kids">` + subs.map(h => {
      const k = view(h), head = h.slice(0, h.length - site.length - 1), rr = byHost.get(h);
      const text = k.excepted ? msg(k.via ? 'stViaExc' : 'stDirectExc')
        : k.covered ? (k.cov === site ? msg('asSite') : msg('coveredBy', [k.cov])) : k.short;
      return `<div class="sp-kid${k.cls}${rr && rr.fail ? ' bad' : ''}">
        <span class="sp-kico">${SUB_I}</span>
        <div class="sp-khost"><b>${esc(head)}</b><s>.${esc(site)}</s></div>
        <div class="sp-kline">${h === host ? `<span class="sp-tag">${esc(msg('thisTab'))}</span>` : ''}${rr ? loadLine([rr]) : ''}<span class="sp-kst">${esc(text)}</span></div>
        ${spSw(h, k)}
      </div>`;
    }).join('') + `</div>`;
  }
  /* сторонние адреса: чужие сайты из учёта запросов, группами по сайту */
  const groups = new Map();
  byHost.forEach(x => {
    const s2 = siteOf(x.host);
    if(s2 === site || x.host.endsWith('.' + site)) return;
    const g = groups.get(s2) || { site:s2, rows:[] };
    g.rows.push(x); groups.set(s2, g);
  });
  const ext = [...groups.values()].map(g => ({ ...g, fails: secFails(g.rows) }))
    .sort((a, b) => a.site.localeCompare(b.site));   /* по алфавиту (4-в); сбой виден меткой и значком раздела */
  if(ext.length){
    const extFails = ext.filter(g => g.fails).length;
    html += secHead('ext', msg('secExt'), ext.length, ext.filter(g => view(g.site).via).length, extFails, secFailLines(ext.flatMap(g => g.rows)));
    if(treeOpen.ext){
      /* подпись раздела — под заголовком (Т8); та же причина — ⓘ у каждой строки */
      const note = esc(msg('extNote'));
      html += `<p class="sp-note">${note}</p>`;
      html += `<div class="sp-kids">` + ext.map(g => {
        const k = view(g.site);
        const hosts = g.rows.map(x => x.host).filter(h => h !== g.site);
        const text = k.excepted ? msg(k.via ? 'stViaExc' : 'stDirectExc') : k.covered ? msg('coveredBy', [k.cov]) : k.short;
        return `<div class="sp-kid ext${k.cls}${g.fails ? ' bad' : ''}">
          <span class="sp-kico">${EXT_I}</span>
          <div class="sp-khost">${esc(g.site)}</div>
          <div class="sp-kline">${loadLine(g.rows, g.site)}<span class="sp-kst">${esc(text)}</span><span class="st-i sp-i" tabindex="0" role="img" aria-label="${note}" data-tip="${note}">${INFO_I}</span></div>
          ${hosts.length ? `<div class="sp-khosts">${esc(hosts.join(' · '))}</div>` : ''}
          ${spSw(g.site, k)}
        </div>`;
      }).join('') + `</div>`;
    }
  }
  /* подвал: счёт выключен / данных нет */
  if(on && settings.siteTrack !== true)
    html += `<p class="sp-none">${esc(msg('trackOff'))} <button class="sp-link" data-go="settings">${esc(msg('trackOn'))}</button></p>`;
  else if(on && !res)
    html += `<p class="sp-none">${esc(msg('noData'))}</p>`;
  /* 7К.2 (Г-2): узел значка переживает перерисовку панели — переносится в новый слот */
  const prevIco = listEl.querySelector('.sp-ico');
  const keepIco = prevIco && prevIco.dataset.for === tabInfo.url && prevIco.firstChild ? prevIco : null;
  listEl.innerHTML = html;
  const ico = $('#spList .sp-ico');
  if(keepIco){ ico.dataset.for = keepIco.dataset.for; ico.replaceChildren(...keepIco.childNodes); }
  else siteIcon(ico);
  /* низ: режим — по селектору (7Л): 'off' — списки выключены; чёрный или белый
     — что он значит, даже пока список пуст (причина В8 — в ⓘ и у корня) */
  const mode = settings.listMode;
  $('#spMode').textContent =
    !on ? msg('modePower')
    : mode === 'off' ? msg('modeOff')
    : mode === 'black' ? msg('modeBlack') : msg('modeWhite');
  /* вернуть фокус той же строке после перерисовки по клику */
  if(focusedD !== null){
    const again = $$('#spList .sp-el').find(w => w.dataset.d === focusedD);
    const b = again && again.querySelector('button');
    if(b && !b.disabled) b.focus();
  }
}
/* заголовок раздела дерева — кнопка-плашка: шеврон, имя, счётчики; у
   свёрнутого раздела со сбоем — значок «!» (правка 3) */
function secHead(key, name, count, via, fails, failText){
  const open = treeOpen[key];
  const badge = !open && fails ? `<span class="sp-secw" data-tip="${esc(failText || msgN('secFails', fails))}">${WARN_I}</span>` : '';
  /* «N из M»: N — через прокси (зелёным, когда не ноль), M — всего (правка человека 19.09) */
  const pair = esc(msg('secOf', [OF_HOLE, String(count)])).replace(OF_HOLE, `<b${via ? ' class="on"' : ''}>${via}</b>`);   /* 7К.2 (Г-4) */
  const nums = `<i>${pair}${fails ? ' · ' + esc(msgN('secFails', fails)) : ''}</i>`;
  return `<button class="sp-sec" data-sec="${key}" aria-expanded="${open}"><span class="sp-sec-ch">${CHEV_I}</span><span class="sp-sec-t">${esc(name)}</span>${badge}${nums}</button>`;
}
/* 7Л, шаг 3: страница «Запросы адреса» — новая вкладка с адресом страницы и
   параметрами: tab — вкладка, host — один адрес ИЛИ site — сайт (несколько
   хостов), theme=light — при светлой теме (как у страницы настроек; ставит
   theme.js до первой отрисовки). Уже открытая страница запросов не ищется:
   у каждой плашки свой адрес, вкладок может быть несколько */
function openRequests(q){
  if(tabId < 0) return;
  const p = new URLSearchParams({ tab: String(tabId) });
  if(q.host) p.set('host', q.host); else if(q.site) p.set('site', q.site);
  if(document.documentElement.dataset.theme === 'light') p.set('theme', 'light');
  chrome.tabs.create({ url: chrome.runtime.getURL('src/requests/requests.html') + '?' + p.toString() })
    .catch(err => console.error('[pxs] не удалось открыть страницу запросов:', err));
}
$('#spList').addEventListener('click', e => {
  const sec = e.target.closest('[data-sec]');
  if(sec){ treeOpen[sec.dataset.sec] = sec.getAttribute('aria-expanded') !== 'true'; renderSitePanel(); return; }
  if(e.target.closest('[data-go]')){ openPage({ go:'settings' }); return; }
  const rq = e.target.closest('[data-rq],[data-rqsite]');
  if(rq){ openRequests({ host: rq.dataset.rq, site: rq.dataset.rqsite }); return; }   /* шаг 3: плашка «N запросов» */
  /* 7Л: запертый при «Выкл» тумблер панели — та же плашка выбора, что у строки */
  const el = e.target.closest('.sp-el');
  if(el && pickable() && el.querySelector('button')?.disabled){ openPick(); return; }
  const b = e.target.closest('[data-act]');
  if(!b || b.disabled) return;
  const d = b.closest('.sp-el').dataset.d;
  const via = b.getAttribute('aria-checked') !== 'true';   /* цель — противоположное положение тумблера */
  if(!tabInfo || d === siteOf(tabInfo.host)) writeRow(d, via);   /* корень — как строка: правила и исключения под сайтом */
  else writeBranch(d, via);                                      /* ветка правит своё правило и своё исключение */
});
$('#spBack').addEventListener('click', () => openSite(false));
$('#spAll').addEventListener('click', () => openPage({ go:'lists' }));   /* раздел «Белые и чёрные списки» на странице */
$('#lsLbl').addEventListener('click', () => openPage({ go:'lists' }));   /* правка человека 20.09 (7): подпись «Списки» с иконкой — туда же */

/* ── старт ── */
document.title = msg('appName');   /* 3Б.2: подстановка __MSG_…__ в HTML расширения не работает, только в манифесте и CSS */
applyStatic();
/* этап 4: подписка раньше чтения — изменение между ними не потеряется.
   Своё эхо и чужие правки приходят одним путём: попап и страница открыты
   вместе → изменение в одном видно в другом. Совпавшее с копией не
   перерисовываем: второй прогон только сбивал бы фокус и переходы */
state.subscribe(ch => {
  if(ch.proxies && !same(ch.proxies, proxies)){
    proxies = ch.proxies;
    renderSel(); renderPower(); renderBadge();   /* 7Г: карточки сроков, «пропал», «новых» — из списка */
    if(!$('#pMenu').hidden) openMenu(true);
    if($('#notif').classList.contains('open')) renderNotifs();
  }
  /* этап 6: кеш аккаунта от фона; null — кеш стёрт (отвязка), поэтому
     проверка по ключу, не по истинности */
  if('account' in ch && !same(ch.account, account)){
    account = ch.account;
    renderBadge();
    if($('#notif').classList.contains('open')) renderNotifs();
  }
  /* 7Г: метки и события панели — своё эхо и события от фона при открытом
     окне (обрыв с переключением, самолечение) */
  if(ch.notifs && !same(ch.notifs, notifs)){
    notifs = ch.notifs;
    renderBadge();
    if($('#notif').classList.contains('open')) renderNotifs();
  }
  /* 7И: кеш файла сообщений от фона (null — кеша нет, проверка по ключу) —
     баннеры панели и число на колокольчике */
  if('remote' in ch && !same(ch.remote, remote)){
    remote = ch.remote;
    setSiteHost(remote ? remote.site : '');   /* 7И, шаг 3: домен ссылок следует за файлом */
    renderBadge();
    if($('#notif').classList.contains('open')) renderNotifs();
  }
  if(ch.settings && !same(ch.settings, settings)){
    const wasTheme = settings.theme;
    const wasTrack = settings.siteTrack;
    settings = ch.settings;
    /* 7Ж: учёт запросов включили или выключили со страницы настроек —
       перечитать запись вкладки (при выключенном siteTrack readPageRec
       очистит её) и перерисовать строку/панель со счётом; 7К.2 (Г-2) —
       один раз, после чтения, а не до и после */
    if(settings.siteTrack !== wasTrack) readPageRec().then(() => renderSetrow());
    else renderSetrow();   /* → renderSite() */
    /* 7З: область уведомлений о сроках сменили на странице — колокольчик и
       панель пересчитываются (при любой записи настроек, как значок в фоне) */
    renderBadge();
    if($('#notif').classList.contains('open')) renderNotifs();
    if(settings.theme !== wasTheme) applyTheme(settings.theme);
  }
  if(ch.state && !same(ch.state, st)){
    const prevErr = st.enabled ? st.lastError : null;
    const wasProbing = probing();   /* 7В */
    const prevId = st.activeProxyId;
    applyState(ch.state);
    /* 7В (В2-а): прокси сменился, пока ждали тост про обрыв (deadT), ошибки
       нет, тумблер переключения включён — это переключение фона: та же
       картинка расстыковки, что при смене по клику, и тост «Обрыв —
       переключились на …» после неё. Смена из соседнего окна приходит без
       'dead' перед ней и остаётся, как была, — без анимации */
    const switched = deadT !== null && settings.failover && st.enabled && !st.lastError && st.activeProxyId !== prevId;
    if(switched){
      clearTimeout(deadT); deadT = null;
      const p = active();
      reconnMsg = p ? msg('lostSwitched', [p.ip]) : null;
      holdReconn();
    }
    renderSel(); renderPower();
    renderSite();   /* 7Ж: строка сайта следует за питанием (st.enabled) */
    if(!$('#pMenu').hidden) openMenu(true);
    noteLastError(prevErr);
    if(wasProbing && !probing()) probeDone();   /* 7В */
  }
});
/* 7Ж: живой счёт загрузки — фон пишет учёт запросов во временную область
   (ключ pageHosts) по мере ответов; пока попап открыт, перечитываем запись
   своей вкладки и перерисовываем строку и панель. Область session отдельна
   от local — своя подписка (storage.js) */
storage.sessionSubscribe(ch => {
  const c = ch[SESSION_KEYS.PAGE_HOSTS];
  if(!c) return;
  /* 7К.2 (Г-2): перечитываем и перерисовываем только когда изменилась запись
     СВОЕЙ вкладки — записи чужих вкладок строку и панель не трогают */
  const all = c.newValue && typeof c.newValue === 'object' ? c.newValue : null;
  const mine = all && tabId >= 0 && all[tabId] ? all[tabId] : null;
  if(same(mine, pageRec)) return;
  readPageRec().then(() => renderSite());
});
state.readAll().then(all => {
  proxies = all.proxies;
  settings = all.settings;
  account = all.account;   /* этап 6 */
  notifs = all.notifs;     /* 7Г */
  remote = all.remote;     /* 7И */
  setSiteHost(remote ? remote.site : '');   /* 7И, шаг 3: домен ссылок из кеша файла */
  applyState(all.state);
  applyTheme(settings.theme);   /* обычно то же, что уже поставил theme.js по адресу */
  renderSel(); renderPower(); renderBadge(); renderSetrow();
  noteLastError(null, true);
  /* 7Ж: вкладка — один раз, после чтения хранилища; до этого строка сайта
     не рисуется (renderSite ждёт tabInfo) */
  return readTab().then(() => { siteIcon($('#stIco')); renderSite(); renderExit();   /* 2.6.1: кнопка перезагрузки знает вкладку */ });
}).catch(err => {
  console.error('[pxs] попап не смог прочитать хранилище:', err);
  toast(msg('errStorage'), true);
});
