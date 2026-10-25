/* src/options/options.js — скрипт страницы расширения. Перенос прототипа
   Страница_v227_2026-09-05.html на этапе 3Б.3, по существу без изменений.
   Подключается как <script type="module"> — иначе не работают импорты
   общего слоя. Всё, что отличается от прототипа, помечено «3Б.3» в коде:
   · тексты — из _locales через msg()/msgN() из i18n.js, пары I18N/L нет;
   · срок, страны и их список, флаги, цвет заметки, тост и шесть иконок —
     из src/shared/; второй реализации здесь нет;
   · атрибут темы — на <html>; до первой отрисовки его ставит theme.js;
   · случайных отказов прототипа нет — ни выбора вида отказа наугад, ни
     случайных чисел: отказ только по сроку;
   · отменённого индикатора качества соединения (samples, connLevel,
     SHOW_MS, CONN_*, startVisits) нет; pings и проверка при подключении
     остаются;
   · стенда (#stand, scn, standMark, resetList, makeProxies, PROXIES_DEMO) нет;
   · глобуса и меню языка нет — решение 07.09, как в попапе (язык задаёт
     браузер);
   · переменная активного прокси переименована в activeProxyId — прежнее
     имя из прототипа стоит в таблице 3.12 мастер-промта как запрещённый
     синоним;
   · версия расширения в диагностике — из манифеста, не константой;
   · 3Б.6: hasGeo и proxyHay — из format.js (были копиями попапа); солнце,
     луна и глаз «скрыть пароль» — iconSun/iconMoon/iconEyeOff из icons.js;
     $, $$ и esc — из dom.js; пороги срока EXP_WARN_DAYS/EXP_BAD_DAYS — из
     format.js; локаль дат — константа DATE_LOCALE; строка прототипа с lang
     в applyStatic и 'use strict' сняты.
   Этап 4 (пометки «этап 4» в коде): демо-данных нет — список, активный
   прокси, питание и настройки читаются из хранилища через state.js и
   перерисовываются по подписке; включение, выключение и переключение —
   сообщения фону ({ cmd:'enable'|'switch'|'disable' }), результат
   засчитывается только тому прокси и тому поколению, для которых стартовал;
   разбор вставки — parse.js общего слоя (переехал отсюда и дописан по
   форматам промта); тосты-обещания стали переходами: «Купить прокси» и
   продление — корзина proxys.io, прокси-чекер — его страница; признак
   раздела из попапа читается из временной области хранилища и
   отрабатывается goSetting(); тема пишется в settings.theme, до первой
   отрисовки её даёт параметр адреса (см. theme.js). В памяти окна (помимо
   копий ключей хранилища) — busy, reconn/reconnT, heroErr/heroErrT,
   поколение попытки connGen, состояние списка и форм (page, listTab,
   showAll, query, editId/editDraft, editTagAt, addingTagFor, geoPickFor/
   geoQuery/geoHintFor, rstArmed, armedWipe, massBusy, domainsT/domainsPatch),
   подсказка tipFor/tipT, сцена cqState/cqMoveT, а с поздних сессий ещё
   pendMsg и deadT (7В), webrtcDenied/privacyOk/webrtcAsking (7А), keyState/
   keyErr/keyPicked/keyGen (этап 6), hkShortcuts и incognitoOk (7Д),
   listOver (7Л).
   Заглушки: пять мест-заглушек до probe.js и checkActive остаются
   замороженными и после 7В (решение 29.08: проверки в интерфейсе нет,
   probe.js к ним не подключён — пометки на местах); третье состояние
   WebRTC — сделано в 7А (ниже); «Написать» в помощи с 7Е ведёт на
   страницу контактов proxys.io (адрес — siteUrl по пути из словаря, см.
   абзац 7Е ниже).
   7В (пометки «7В» в коде): диагностика печатает результат проверки при
   подключении из state.lastProbeAt/lastProbeMs, которые пишет фон
   («N мс (дата)» / «не прошла (дата)» / «не измерялся» / «проверка
   отключена» по тумблеру); кнопка «Проверить активный прокси» снята из
   помощи вместе с обработчиком (решение человека 11.09, В3-а, отклонение
   от прототипа Страница_v227) — в разделе «не отвечает» осталась одна
   кнопка, прокси-чекер на сайте. Вторая и третья выдачи 7В (решения
   человека 11.09): пока фон держит state.probing при включённом прокси —
   герой в состоянии подключения с той же подписью «Подключение», тост
   «Подключен через…» / «Переключились на…» ждёт конца проверки (pendMsg
   — память окна); результат без кода на экран не выходит — только
   диагностика; переключение, сделанное фоном при обрыве, показывается
   как ручная смена (картинка расстыковки без команды фону, тост
   lostSwitched вместо «Ошибка подключения»; deadT — память окна).
   Этап 6 (пометки «этап 6» в коде): загрузка по ключу — команда фону
   keyLoad с полем key, ответ засчитывается только своему поколению
   keyGen и только в состоянии «загрузка» (аудит 3Б.4: «Отвязать» во время
   загрузки бросает ответ); ключ в settings.apiKey пишет фон после удачного
   ответа, страница его не пишет; список аккаунта — копия кеша account из
   хранилища (при старте и по подписке), а не ответ на память; в запись из
   аккаунта уходит orderId; при account.error под ключом — «ключ больше не
   действует» (accKeyDead); бессрочный на экране выбора — без подписи срока.
   Правки интерфейса по решению человека 10.09 (отклонения от прототипа
   Страница_v227, записаны в DECISIONS): «Изменить ключ» на экране отказа;
   тумблер «Обновлять список из аккаунта» (SET_ACC) под ключом; кнопка
   «Обновить сейчас» рядом с ним — команда фону keyRefresh.
   7А (пометки «7А» в коде): тумблер «Блокировать WebRTC» действует —
   включение запрашивает разрешение privacy прямо из клика
   (chrome.permissions.request), выключение только пишет настройку,
   разрешение не отзывает; третье состояние — по прототипу: тумблер
   выключен и под ним строка .opt-deny, когда браузер отказал в
   разрешении (webrtcDenied — память окна, как в прототипе) или когда
   настройка включена, а разрешения нет (chrome.permissions.contains:
   отозвано либо ещё не спрашивали); страница слушает
   chrome.permissions.onAdded/onRemoved сама (решение человека 10.09,
   В1-а); в диагностике пометка diagDenied; саму политику браузера
   ставит и снимает фон.
   7Л (пометки «7Л» в коде; решение человека 19.09, отклонение от прототипа
   Страница_v227 в разделе «Списки»): режим списков — одно поле
   settings.listMode ('off' | 'black' | 'white'), списки — два независимых
   поля listBlack и listWhite; тумблера «Использовать список» и поля
   listDomains нет (сняты), автовключения режима по первому адресу и
   опускания при опустевшем поле нет (В10). Раздел — селектор режима и два
   блока с полями (renderLists), импорт и экспорт у каждого блока свои;
   герой — «Чёрный список: N» / «Белый список: N»; диагностика — режим и
   счёт обоих списков. Правки человека 20.09: у каждого блока кнопка
   «Очистить список» с корзиной у правого края ряда (двухшаговое
   подтверждение в кнопке, clearList); выбранные «Чёрный»/«Белый» в
   селекторе — зеленоватой плашкой, как в попапе (только CSS).
   7Д (пометки «7Д» в коде; ответы проверяющего чата 21.09): вкладка
   «Горячие клавиши» переписана под три команды манифеста — первой строкой
   тумблер settings.hotkeys (решение человека 19.09, п. 6), затем строки
   toggle-proxy, next-proxy и _execute_action; сочетания берутся у
   браузера (getAll в readShortcuts) при старте, при открытии вкладки и
   при возвращении на страницу (пустое — «не назначено»; API нет —
   умолчания из манифеста), поэтому тексты не врут о переназначенных
   сочетаниях; строки «Отключить прокси» (Ctrl+Shift+0) и её ключей нет;
   кнопка копирования адреса страницы сочетаний — как была. Инкогнито
   (7.8): один вызов «разрешено ли в инкогнито» (readIncognito) при старте
   — строка диагностики и, при запрете, бейдж справа от заголовка и
   предупреждение в карточке помощи; кнопка карточки копирует адрес
   карточки расширения (с ?id=). Правки человека 21.09 после проверки:
   бейдж справа от заголовка (не под подзаголовком), тумблер «Горячие
   клавиши» по умолчанию выключен.
   7Е (пометки «7Е» в коде; ревизия страницы, ответы проверяющего чата
   21.09): подсказки data-tip рисует один пузырь #tip по образцу попапа
   (showTip/hideTip; раньше на странице механизма не было — решение человека
   21.09); форма добавления и правка строки — одна подпись «HTTP / HTTPS»,
   кнопки HTTPS и SOCKS5 скрыты (hidden), segBtn и ключи подсказок на месте,
   type в данных — литерал 'HTTP' (решение человека 15.09); «Продлить» (чип
   срока в герое, меню строки, чип истёкшего) → кабинет (ключ urlMy), «Купить
   прокси» — корзина как была; «Написать» в помощи → страница контактов
   (новый ключ адреса, прежний тост и его ключ сняты); диагностика — строки
   levelOfControl, все десять тумблеров, последняя ошибка и до пяти
   событий фона (читаются один раз при сборке); импорт списков отсеивает
   повторы и внутри файла; комментарии замороженного блока чекеров
   приведены к 7В.
   7И (пометки «7И» в коде; решения человека 24.09): код API 1002 — вид
   'empty' (kErrEmpty на экране отказа и в тосте «Обновить сейчас», путь
   тот же, что у 'bad'); домен ссылок — из поля site файла сообщений (кеш
   remote, одинаково для всех локалей): четыре ключа url* словаря хранят
   пути, адрес собирает siteUrl из links.js, хост ставит
   setSiteHost при старте и по подписке на remote; строка диагностики «Файл
   сообщений: N, домен X, получен дата | нет | отказ» (diagRemote*) без
   адресов — по образцу diagEvents, из того же readAll при сборке. */
import { msg, msgN, uiLang } from '../shared/i18n.js';
import { siteUrl, setSiteHost, siteHost } from '../shared/links.js';   /* 7И: хост ссылок — из файла сообщений */
import { $, $$, esc } from '../shared/dom.js';
import { quietGlass } from '../shared/quiet-glass.js';   /* 2.5.1: без blur во время прокрутки */
import { toast } from '../shared/toast.js';
import { ICON_ARROW, ICON_CLOCK, ICON_WARN, ICON_LIST, ICON_GEAR, iconSun, iconMoon, iconEyeOff } from '../shared/icons.js';
import { expDays, expLabel, expShort, isExpired, geoName, geoPlace, tagStyle, flag, COUNTRIES, CC_MAP, hasGeo, proxyHay, EXP_WARN_DAYS, EXP_BAD_DAYS } from '../shared/format.js';
import * as state from '../shared/state.js';
import * as storage from '../shared/storage.js';
import { parseProxyLines, hostPort, isValidAddr, TAG_MAX, TAG_LEN, listField, normalizeDomains } from '../shared/parse.js';
import { PROXY_TYPES, typeLabel, normType } from '../shared/proxytype.js';   /* 2.1: типы, подпись и проверка — один источник со схемой и фоном */   /* TAG_LEN (7К.2, Е-2): длина заметки — одна с разбором */   /* 7Л: listField — имя поля списка по режиму, одно с попапом; normalizeDomains — счёт годных строк в диагностике */
import { SESSION_KEYS, LIST_MODES, NOTIF_SCOPES, NOTIF_WATCH_MAX } from '../shared/constants.js';   /* 7З: область уведомлений о сроках и предел отмеченных адресов */
import { zoneOffsetLabel } from '../shared/tzcore.js';   /* 2.2: подпись смещения в строке пояса */
import { SETTINGS } from '../shared/schema.js';   /* 7К.2 (Б-2): предел поля списка — из схемы, тот же источник, что у попапа */

/* ── данные ─────────────────────────────────────────────── */
/* src — откуда прокси попал в список, и это не бухгалтерия:
   от него зависит, что мы вообще про прокси знаем.
     'pxs'    — загружен из proxys.io (ключ API, личный кабинет):
                вместе с адресом приходят страна и срок аренды;
     'manual' — вбит руками (строкой или полями): кроме адреса и
                кредов, у нас нет ничего. Страну по IP не гадаем —
                показали бы догадку под видом факта.
   Этап 4: демо-набор из двадцати прокси снят. Здесь лежат КОПИИ трёх
   ключей хранилища (proxies, settings, state); меняются они только через
   функции записи state.js, правка копии до записи никуда не попадёт. */
let proxies = [];
let settings = { ...state.DEFAULT_SETTINGS };
let st = { ...state.DEFAULT_STATE };

/* ── ПРОКСИ В АККАУНТЕ ──────────────────────────────────────
   Что вернул сервер по ключу API. Этап 4: демо-набор снят. Этап 6: это
   копия кеша account из хранилища ({ at, items, error } либо null) — его
   пишет только фон после удачной загрузки и обновляет раз в шесть часов;
   accountProxies — его items. В хранилище прокси попадают только
   добавленные человеком. На «уже добавлен» видно состояние строки: строка
   на месте, но выбрать её нельзя и в счётчик она не идёт. */
let account = null;
let accountProxies = [];

/* 3Б.3: слепка PROXIES_DEMO нет — к нему возвращался только стенд
   после сценариев на сотни строк (makeProxies тоже не перенесён) */

/* выбранный прокси ≠ включённое соединение (как в макете:
   строка активна, но соединение может быть выключено) */
let activeProxyId = '';   /* 3Б.3: имя из таблицы 3.12 мастер-промта; прежнее имя прототипа — запрещённый синоним.
                             Этап 4: зеркало st.activeProxyId — строка, пусто — '' (не null); пишется через applyState() */
function applyState(next){ st = next; activeProxyId = st.activeProxyId; }
/* Питание (этап 4): «включено» — это st.enabled из хранилища; busy —
   ждём ответа фона; reconn — фаза расстыковки при смене прокси. Своей
   переменной power нет, чтобы страница не могла разойтись с браузером.
   Во время расстыковки герой выглядит выключенным, как в прототипе.
   off | busy | on */
let busy = false;
let reconn = false, reconnT = null;  /* фаза расстыковки при смене прокси */
/* 7В: проверка при подключении идёт — фон держит state.probing; герой в
   том же «занято» и с той же подписью «Подключение», что при ответе фона
   (решение человека 11.09: отдельного слова у проверки нет). Кнопка
   питания живая: выключить можно всегда */
const probing = () => st.enabled && st.probing === true && !st.lastError;   /* ошибка пришла раньше конца проверки — герой красный, не «Проверяем…» */
const power = () => reconn ? 'off' : (busy || probing()) ? 'busy' : st.enabled ? 'on' : 'off';   /* 7В: probing */
let pendMsg = null;   /* 7В: тост, отложенный до конца проверки при подключении или расстыковки */
let showPass = false;
let heroErr = null, heroErrT;   /* причина неудачного включения: 'dead' | 'auth' | 'exp' и коды ответа фона — только память окна */
let connGen = 0;                     /* поколение попытки: отменяет устаревшие таймеры и ответы фона */
/* причина ошибки для показа: срыв включения из памяти окна либо
   state.lastError из хранилища, пока прокси включён ('auth' ставит
   обработчик авторизации фона; 'dead' — этап 7) */
const heroError = () => heroErr || (st.enabled && st.lastError) || null;

/* настройки: тумблеры реально управляют поведением. Этап 4: копия
   settings из хранилища (см. выше), умолчания — state.DEFAULT_SETTINGS;
   объекта DEF_SET в памяти окна нет. Ключ привязан, когда settings.apiKey
   не пуст, — отдельного флага нет */
const apiLinked = () => settings.apiKey !== '';
let rstArmed = false, rstTimer;
const pings  = {};           // id → число мс | 'dead' (не отвечает) | 'auth' (неверные данные)
/* 3Б.3: массива samples под комментарием ниже нет — это отменённый
   индикатор качества соединения (решение 29.08; промт 3Б.3: samples,
   connLevel, SHOW_MS, CONN_GOOD, CONN_MID не переносить). Комментарий
   прототипа оставлен: он объясняет, чем pings отличается от замеров и
   почему pings остаётся — на нём держатся проверка при подключении,
   колонка состояния, уборка при удалении и правке, автопереключение. */
/* ── ЗАМЕРЫ ПО НАСТОЯЩИМ СТРАНИЦАМ ─────────────────────────
   Хранятся отдельно от pings, и это принципиально.
   pings — результат проверки при подключении: она дёргает
   маленький файл (в расширении favicon.ico), и число выходит
   заведомо меньше, чем у целой страницы. Примени к ним одни
   пороги — и при подключении будет «Хорошее», а через минуту,
   на первых же настоящих страницах, «Среднее». Человек прочтёт
   это как ухудшение связи, хотя ничего не изменилось.
   Поэтому проверка при подключении даёт только «Работает»,
   а уровень считается вот по этим замерам и только по ним. */
/* 7А: третье состояние тумблера WebRTC — память окна, не настройка
   (в прототипе флаг webrtcDenied жил так же; этап 4 снимал его как
   демо-переключатель, 7А вернул с настоящим запросом разрешения).
     webrtcDenied — браузер отказал в разрешении privacy: «Запретить» в
                    окне запроса либо отзыв в chrome://extensions
                    (chrome.permissions.onRemoved, решение В1-а);
                    снимается удачным запросом и «Сбросить настройки»;
     privacyOk    — есть ли у расширения разрешение privacy
                    (chrome.permissions.contains); null — ещё не узнали;
     webrtcAsking — окно запроса открыто, второй клик по тумблеру ждёт. */
let webrtcDenied = false;
let privacyOk = null;
let webrtcAsking = false;
const PRIVACY = { permissions:['privacy'] };
/* тумблер показывается включённым, только если настройка включена И
   разрешение у браузера есть: рисовать «включено» без разрешения нельзя,
   защиты-то нет. Строка под описанием — при отказе браузера либо когда
   настройка включена, а разрешения нет: отозвано или ещё ни разу не
   спрашивали (так у всех после обновления: у прежней версии этого
   разрешения не было, а настройка включена по умолчанию) */
const webrtcOn   = () => settings.webrtc && privacyOk !== false;
const webrtcDeny = () => webrtcDenied || (settings.webrtc && privacyOk === false);
const checking = new Set();  // id прокси, которых сейчас опрашивает чекер

/* ── ПРОКСИ-ЧЕКЕРЫ: ЗАМОРОЖЕНЫ ───────────────────────────
   Проверка убрана из интерфейса, но не из кода: разметка,
   стили и вся механика (pings, checking, startCheck, rcheckHtml,
   массовая проверка, разбор отказов, авто-отключение по обрыву)
   остались на местах. 7Е (приведено к 7В): настоящая проверка
   при подключении живёт в фоне (probe.js — пять запросов через
   прокси, при белом списке три; вердикт 'auth'/'dead' по
   однозначным кодам, результат в state.lastProbeAt/lastProbeMs
   и в диагностике), к этому блоку она не подключена (решение
   29.08): pings здесь наполняет только заглушка connect()
   числом 28, и никакой вход в блок сюда не ведёт.

   Флаги и что за ними стоит:
     hero — «Проверить подключение» в герое;
     row  — инлайн-проверка в строке списка (колонка состояния);
     all  — «Проверить все прокси» в футере и мостик из помощи.

   ── ФЛАГИ НЕ ПОДНИМАТЬ ──
   Массовая и построчная проверка отменены решением, а не
   отложены. Поднять row «потому что код готов» нельзя: проверить
   неактивный прокси — значит пустить через него запрос, минуя
   текущее соединение, а для этого нужен PAC-скрипт. Это отдельная
   конструкция со своим жизненным циклом, и заводить её надо
   отдельным решением, а не переключением булева флага.
   Уцелел ровно один вход — проверка при подключении: там прокси
   уже активен, и лишней машинерии не требуется.
   Код колонки готов и пусть лежит: он ничего не стоит, пока флаг
   выключен, и его наличие не является доводом за подъём.

   canCheck решает, кому проверка доступна: под сценарий
   «проверяем только прокси по ключу» — вернуть p.src === 'pxs'.
   Вёрстку подстраивает класс .no-chk на body (см. CSS). */
const CHECKERS = { hero:false, row:false, all:false };
const canCheck = p => !!p;   /* будущее: p => p.src === 'pxs' */

/* 3Б.6: hasGeo — из format.js, одна на оба окна; комментарий прототипа о
   двух источниках страны и о том, почему по IP не гадаем, переехал туда же */

/* состояние списка. PER_PAGE 10: три строки на страницу
   превращали любой рабочий список в листалку.
   Этап 4: TAG_MAX — из parse.js (там же ограничение длины заметки);
   счётчика seq нет — идентификаторы даёт newProxyId() из state.js */
const PER_PAGE = 10;
let page = 1, listTab = 'list';
let showAll = false;   /* режим «показать все прокси» без страниц */
let settingsDirty = false;   /* 2.5.1: настройки, отложенные подпиской — собираются при показе */
let editId = null, editDraft = null;
let editTagAt = null;        /* {id,i}: какая заметка редактируется по клику */
let addingTagFor = null;
let armedWipe = false, wipeTimer;
/* 3Б.6: esc, $ и $$ — из dom.js, одни на оба окна */
const active = () => proxies.find(p => p.id === activeProxyId) || null;
/* локаль дат в тексте: «до <дата>» у прокси из аккаунта и дата в диагностике.
   en-US и en-GB — оба английский, остальное считаем русским (uk — копия ru).
   3Б.6: одна константа вместо двух одинаковых выражений; понадобится
   фону — переезжает в i18n.js */
const DATE_LOCALE = uiLang.startsWith('en') ? 'en-GB' : 'ru-RU';

/* ── связь с хранилищем и фоном (этап 4) ── */
/* сообщения фону. Контракт: { cmd:'enable', id } | { cmd:'switch', id } |
   { cmd:'disable' }, ответ { ok:true } либо { ok:false, error }.
   Не ответил — 'noAnswer' */
function send(cmd){
  return chrome.runtime.sendMessage(cmd)
    .then(r => (r && typeof r === 'object') ? r : { ok:false, error:'noAnswer' })
    .catch(() => ({ ok:false, error:'noAnswer' }));
}
/* перечитать состояние после ответа фона: enabled и activeProxyId к этому
   моменту он уже записал, подписка донесёт их чуть позже */
async function refreshState(){ applyState(await state.getState()); }
/* запись не удалась: в консоль и человеку */
function storageFail(err){
  console.error('[pxs] не удалось записать данные:', err);
  toast(msg('errStorage'), true);
}
/* записать список как есть — после правки заметок, страны и строки */
function persist(){ return state.setProxies(proxies).catch(storageFail); }
/* записать поле настроек: копия меняется сразу (тумблер не ждёт
   хранилища), подписка потом принесёт то же значение */
function writeSetting(patch){
  settings = { ...settings, ...patch };
  return state.patchSettings(patch).catch(storageFail);
}
/* текст к коду ошибки: 'auth' и 'dead' — как в прототипе, 'exp' — срок,
   два уровня управления — из proxy.js фона, остальное — общая ошибка */
/* 2.6: SOCKS-прокси с логином не подключится никогда — Chrome предлагает
   SOCKS-серверу только метод без авторизации. Вместо невнятного «нет
   ответа» строка называет настоящую причину. */
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
   ошибки и при открытии страницы с висящей ошибкой (ключи errShort*,
   connErr ждали этапа 4) */
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
/* снять незавершённое: устаревший таймер расстыковки и ответ фона
   больше ничего не трогают */
function cancelPending(){
  connGen++; clearTimeout(reconnT); reconn = false; busy = false;
}
/* Записать список и, если он сменился, новый активный прокси. Пока прокси
   включён (или включается), активного меняет только фон: переключаем
   через него, а пустой выбор — выключаем; выключен — пишем выбор сами.
   Список пишется ПОСЛЕ этого: между записью списка и переключением
   обработчик авторизации фона не нашёл бы активную запись и заглянул бы
   в ключ прошлой версии. Отсюда же ответ на вопрос 3Б.5 «подключать ли
   соседа автоматически при удалении активного»: да, как в прототипе —
   выключить значило бы пустить трафик напрямую, мимо всех прокси. */
async function commitList(list, nextActive){
  if(nextActive !== activeProxyId){
    if(st.enabled || busy || reconn){
      cancelPending();
      if(nextActive){
        busy = true; renderHero();
        const res = await send({ cmd:'switch', id: nextActive });
        busy = false;
        if(!res.ok){ toast(errText(res.error), true); await send({ cmd:'disable' }); }
      } else {
        await send({ cmd:'disable' });
      }
      await refreshState();
    }
    if(!st.enabled) await state.patchState({ activeProxyId: nextActive });
    applyState({ ...st, activeProxyId: nextActive });
  }
  proxies = list;
  await state.setProxies(list);
}
/* одинаковое ли содержимое — чтобы эхо собственной записи из хранилища
   не перерисовывало страницу второй раз */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* ключ показывается замаскированным: первые и последние четыре знака */
const maskKey = k => k.length > 12 ? k.slice(0, 4) + '••••••••••' + k.slice(-4) : '••••••••••';

/* ════════ ЯЗЫК ИНТЕРФЕЙСА (I18N-DICT-START) ════════
   Все надписи живут парой ru/en; L — активный словарь.
   Заметки прокси — данные пользователя, они не переводятся.
   3Б.3: пара ru/en переехала в _locales/{en,ru,uk}/messages.json;
   словаря I18N и переменной L в коде больше нет — каждое L.ключ стало
   msg('ключ') из src/shared/i18n.js, 32 функции-ключа страницы —
   подстановками $1/$2/$3 (exportedN и kFound — формами
   _one/_few/_many/_other через msgN()). Язык даёт браузер (uiLang),
   переключателя нет — строка прототипа о хранении выбора языка в области
   синхронизации снята: эта область запрещена мастер-промтом (3.5).
   Ключи, переименованные при сведении словарей (отчёт 3Б.1, таблица 4.1):
   tabAdd и blankBtn → addProxy, lblBulk → pastePh, expiredRow → errExp,
   rcAuth → wrongCreds, miRenew → renew, pgBack → back, tabListsSm →
   listsWord, geoAriaWait → geoUnk, ariaLogin → lblLogin, ariaPass →
   lblPass, copyTitle → miCopy, heroEditT → miEdit, rAddr/rPort/rLogin/rPass
   → phAddr/phPort/phLogin/phPass, searchClearA → searchReset, lblKey →
   apiKey, help[1].btn → apiLink; решение 3Б.3: help[4].btn → copyAddr.
   Вложенные ключи уплощены: diag.black → diagBlack (35), set.webrtc.t →
   setWebrtcT (14), hkSet.t → hkSetT (8), help[i].tt → help0Tt … (39, форма
   разделов — таблица HELP в applyStatic), страны — geo_NL (52, в общем
   слое с 3Б.1). geoName берётся из format.js: строка «const geoName = cc
   => L.geo[cc] || cc» не перенесена.
   Пояснения, стоявшие в словаре комментариями при ключах, переехали в
   поле description этих ключей в messages.json: «числа в миллисекундах
   заморожены, не удалены» (cqMs, msN, chkMs), «подпись питания называет
   состояние, а не действие» (pwrFail — с 3Б.2), «вторая фраза
   обязательна» (tipConn), адрес прокси-чекера (checkerToast — ключ снят
   7К.2, кнопка ведёт на страницу чекера через urlChecker), «обещать,
   что ручная отметка не изменится, нельзя» (geoTipSet), «Firefox отложен,
   не отклонён» (kbFf), английский pwrOn короче русского ради панели
   коннектора (pwrOn — с 3Б.2). Групповые заголовки словаря («добавлено
   после v188», «страна», «нет в аккаунте», «формы добавления», «по
   ключу», «настройки», «помощь и диагностика») — только порядок ключей в
   прототипе, в messages.json их нет. */

/* статичные узлы разметки: перевод адресной раздачей по селекторам */
function applyStatic(){
  /* 3Б.6: строка прототипа, ставившая lang, снята — то же значение ставит
     theme.js до разбора разметки, второй раз оно ничего не меняло */
  document.title = msg('docTitle');
  $('#nav').setAttribute('aria-label', msg('navAria'));
  $('#nav [data-go="proxy"] span').textContent = msg('navProxy');
  $('#nav [data-go="settings"] span').textContent = msg('navSettings');
  $('#nav [data-go="help"] span').textContent = msg('navHelp');
  $('#buyT').textContent = msg('buy');
  $('#btnTheme').title = document.documentElement.dataset.theme === 'light' ? msg('themeToDark') : msg('themeToLight');
  $('#btnTheme').setAttribute('aria-label', msg('themeToggle'));
  /* 3Б.3: три строки про #btnLang и #langMenu сняты вместе с глобусом */
  /* герой */
  const credL = $$('.cred .lbl');
  if(credL[0]) credL[0].textContent = msg('lblLogin');
  if(credL[1]) credL[1].textContent = msg('lblPass');
  $('#vLogin').title = msg('miCopy'); $('#vPass').title = msg('miCopy');
  $('#btnHeroEdit').title = msg('heroEdit');
  $('#btnHeroEdit').setAttribute('aria-label', msg('heroEdit'));
  $('#heroEditT').textContent = msg('miEdit');
  $('#stMode').title = msg('lmOpen');
  $('.cnw .s-off').textContent = msg('linkOff');
  $('.cnw .s-busy').textContent = msg('linkBusy');
  $('.cnw .s-on').textContent = msg('linkOn');
  $('.cnw .s-err').textContent = msg('linkErr');
  if(!$('#btnCheck').dataset.phase)
    $('#checkT').innerHTML = `<span class="chk-lg">${msg('chkLg')}</span><span class="chk-sm">${msg('chkSm')}</span>`;
  $('#ping .lbl').textContent = msg('lblPing');
  renderConn();   /* слово, число и подсказка блока живут в нём самом */
  /* список */
  $('#listHintT').textContent = msg('listHint');
  $('#ltabs [data-ltab="add"] .tlt').textContent = msg('addProxy');
  $('#ltabs [data-ltab="list"] .tlt').textContent = msg('tabList');
  if(!massBusy) $('#chkAllT').textContent = msg('chkAll');
  $('#btnDedup').textContent = msg('dedup');
  $('#exportT').textContent = msg('exportList');
  $('#lq').placeholder = msg('searchPh');
  $('#lq').setAttribute('aria-label', msg('searchPh'));   /* этап 9 (проход Г, п. 1): имя поля — не только placeholder */
  $('#lqX').setAttribute('aria-label', msg('searchReset'));
  /* добавление */
  $('.a-q').textContent = msg('aQ');
  $('#segMode [data-amode="paste"] .amo-tt').textContent = msg('amPasteT');
  $('#segMode [data-amode="paste"] .amo-d').textContent = msg('amPasteD');
  $('#segMode [data-amode="fields"] .amo-tt').textContent = msg('amFieldsT');
  $('#segMode [data-amode="fields"] .amo-d').textContent = msg('amFieldsD');
  $('#segMode [data-amode="key"] .amo-tt').textContent = msg('amKeyT');
  $('#segMode [data-amode="key"] .amo-d').textContent = msg('amKeyD');
  $('#am-paste .lbl').textContent = msg('pastePh');
  $('#bulk').setAttribute('aria-label', msg('pastePh'));   /* этап 9 (проход Г, п. 1): подпись .lbl с полем не связана — имя полю */
  $('#am-paste .f-note:not(.sub)').innerHTML = msg('noteFormats');
  $('#am-paste .f-note.sub').innerHTML = msg('noteFormats2');
  $('#btnBulk').textContent = msg('add');
  $('#btnTypeCheck').textContent = msg('typeCheckBtn');   /* 2.1: надпись из словаря, как у соседей */
  const fLbls = $$('#am-fields .lbl');
  if(fLbls[0]) fLbls[0].textContent = msg('lblAddrPort');
  if(fLbls[1]) fLbls[1].textContent = msg('lblCreds');
  if(fLbls[2]) fLbls[2].textContent = msg('lblProto');
  /* этап 9 (проход Г, п. 1): подписи .lbl общие на пару полей — имя каждому полю, как у правки строки (ariaAddr/ariaPort) */
  $('#fIp').setAttribute('aria-label', msg('ariaAddr'));
  $('#fPort').setAttribute('aria-label', msg('ariaPort'));
  $('#fLogin').setAttribute('aria-label', msg('lblLogin'));
  $('#fPass').setAttribute('aria-label', msg('lblPass'));
  $('#am-fields .f-note:not(.sub)').textContent = msg('noteGeoManual');
  $('#am-fields .f-note.sub').textContent = msg('noteProto');
  /* Подсказок теперь две, и брать «первую отключённую» больше
     нельзя — каждая ищется по своей надписи. */
  $$('#segType [aria-disabled="true"]').forEach(b => {
    b.dataset.tip = b.textContent.trim() === 'HTTPS' ? msg('tipHttps') : msg('tipSocks');
  });
  $('#btnAdd').textContent = msg('add');
  /* по ключу: ввод → загрузка → выбор, плюс два тупика */
  $('#kSt-input .lbl').textContent = msg('apiKey');
  $('#fKey').setAttribute('aria-label', msg('apiKey'));   /* этап 9 (проход Г, п. 1) */
  $('#kSt-input .f-note:not(.sub)').textContent = msg('noteKey1');
  $('#kSt-input .f-note.sub').textContent = msg('noteKey2');
  $('#btnKey').textContent = msg('kShow');
  $('#kSt-load p').textContent = msg('kLoading');
  $('#kSt-err [data-kretry]').textContent = msg('kRetry');
  if(keyState === 'err') $('#kErrT').textContent = keyErrText();
  $('#kSt-empty p').textContent = msg('kEmpty');
  $$('#am-key [data-kback]').forEach(b => (b.querySelector('span') || b).textContent = msg('kChangeKey'));   /* этап 6: у кнопки экрана отказа текст в span рядом со значком */
  $('#am-key [data-kall="1"]').textContent = msg('kSelAll');
  $('#am-key [data-kall="0"]').textContent = msg('kSelNone');
  $('#btnKeyAll').textContent = msg('kAddAll');
  $('#btnKeySel').textContent = msg('kAddSel', [String([...keyPicked].filter(i => !inList(accountProxies[i])).length)]);
  if(keyState === 'pick') renderKeyPick();   /* заголовок, строки и счётчик на кнопке */
  /* настройки: вкладки и шапки секций */
  const stab = k => $('#stabs [data-stab="' + k + '"]');
  stab('base').querySelector('.tab-lg').textContent = msg('tabBaseLg');
  stab('base').querySelector('.tab-sm').textContent = msg('tabBaseSm');
  stab('keys').querySelector('.tab-lg').textContent = msg('tabKeysLg');
  stab('keys').querySelector('.tab-sm').textContent = msg('tabKeysSm');
  stab('lists').querySelector('.tab-lg').textContent = msg('tabListsLg');
  stab('lists').querySelector('.tab-sm').textContent = msg('listsWord');
  $$('#sp-base .set-cap').forEach((el, i) => el.textContent = [msg('capConn'), msg('capUi'), msg('capSite'), msg('capAcc')][i]);   /* 7Ж: capSite между «Интерфейс» и «Аккаунт» */
  /* помощь */
  /* 3Б.3: массив help прототипа стал плоскими ключами help0Tt … help7Btn
     (в messages.json массивов нет). Здесь остаётся только форма восьми
     разделов — у какого какие поля и сколько, — чтобы тексты легли на те
     же узлы, что в прототипе. Две кнопки сведены с ключами настроек:
     help[1].btn → apiLink (3Б.1), help[4].btn → copyAddr (3Б.3).
     7В: в разделе «не отвечает» кнопка одна — прокси-чекер на сайте
     (help5Btns1); «Проверить активный прокси» (help5Btns0) снята из
     разметки и обработчика (решение человека 11.09); ключ снят из
     словарей на 7К.2 (уборка). */
  const HELP = [
    { note:true },
    { steps:4, note:true, btn:'apiLink' },
    { note:true, btn:true },
    { note:true, btn:true },
    { note:true, btn:'copyAddr' },
    { steps:3, btn:'help5Btns1' },
    { notes:2, btn:true },
    { note:true, btn:true },
  ];
  const haccs = $$('#v-help .hacc');
  HELP.forEach((h, i) => {
    const a = haccs[i]; if(!a) return;
    /* 7Д: у карточки про инкогнито в заголовке живёт бейдж «сейчас запрещено» —
       меняем только текстовый узел; отступ бейджа от текста — в CSS (.hacc-tt .pin) */
    const tt = a.querySelector('.hacc-tt');
    if(tt.firstChild && tt.firstChild.nodeType === 3) tt.firstChild.nodeValue = msg('help' + i + 'Tt');
    else tt.textContent = msg('help' + i + 'Tt');
    a.querySelector('.hacc-s').textContent = msg('help' + i + 'S');
    if(h.note) a.querySelector('.h-note').innerHTML = msg('help' + i + 'Note');
    if(h.notes) a.querySelectorAll('.h-note').forEach((n, j) => n.innerHTML = msg('help' + i + 'Notes' + j));
    if(h.steps) a.querySelectorAll('.steps li').forEach((li, j) => li.innerHTML = msg('help' + i + 'Steps' + j));
    if(h.btn){ const b = a.querySelector('.h-act .btn-ft'); if(b) b.firstChild.nodeValue = msg(h.btn === true ? 'help' + i + 'Btn' : h.btn); }
  });
  $('#incogPin span').textContent = msg('incogOff');   /* 7Д: бейдж (значок «стоп» + текст) и предупреждение карточки про инкогнито — видимость ставит renderIncognito */
  $('#hIncogWarn b').textContent = msg('incogWarn');
  $('.hsupport p').innerHTML = msg('hSupport');
  $('#hSupport').textContent = msg('hWrite');
  /* карточка страны и список стран собираются заново при
     следующем наведении — старые на прежнем языке убираем */
  hideGeoHint(true);   /* 7К.2 (уборка Д-8): объявление функции поднято — проверка typeof была лишней */
}
/* ════════ (I18N-DICT-END) ════════ */


/* ── помощники ──────────────────────────────────────────── */
/* 3Б.3: toast() отсюда ушёл в src/shared/toast.js (совпадал с попапом
   побайтно) и импортируется сверху; разметка тоста с точкой .t-dot и его
   стили остаются у страницы свои */

/* ── ФЛАГИ ──────────────────────────────────────────────────
   3Б.3: машинерия флагов ушла в src/shared/format.js; 2.4: рецепты
   заменены спрайтом — flag() возвращает ячейку src/assets/flags.png
   (255 стран), COUNTRIES — все коды спрайта для списка выбора, CC_MAP —
   проверка кода в setGeo. Серый прямоугольник «страна не известна» —
   FLAG_NONE из icons.js. */

/* Три разные подсказки на одну метку — потому что причина, по
   которой страны нет, у прокси разная, и следующий шаг тоже */



/* страну руками ставят только у своих: у прокси из аккаунта
   она приходит по ключу, и спорить с источником нечем */
const canPickGeo = p => p.src !== 'pxs';
let geoPickFor = null;   /* id прокси, которому сейчас выбирают страну */
let geoQuery = '';       /* строка поиска в списке стран */

/* чип «страна · протокол». Страны нет — на её месте пустой слот
   ровно по габариту флага: ширина слота одна, поэтому строки
   с флагом и без него не разъезжаются */
/* Метка страны объясняется карточкой, а не подсказкой на
   ::after: в псевдоэлемент не навести курсор, а объяснение
   без кнопки половинчато — узнав, что страну можно поставить
   самому, человек тут же хочет её поставить. Поэтому у метки
   только data-geotip, а карточку по наведению собирает JS
   (см. showGeoHint). */
/* плюс внутри слота — маленький, по габариту рамки */
const GQ_PLUS = '<svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 1.3v5.4M1.3 4h5.4"/></svg>';

/* Чип «страна · протокол». В герое он живёт по другим правилам:
   у героя overflow:hidden, и ни карточка, ни список стран из
   него не выедут — обрежет по кромке. Поэтому там метка только
   подводит к строке в списке и открывает выбор уже в ней. Так
   же устроена быстрая правка активного прокси (#btnHeroEdit):
   герой показывает, список правит. */
/* 2.4: метка места — флаг и «Philippines, Lahug». Отделена от чипа: в
   строке списка она живёт сама по себе, сразу после адреса, как в
   таблицах чекеров, а тип уехал в нижнюю строку отдельным чипом. */
function geoHead(p, hero){
  const pick = canPickGeo(p);
  const hook = hero
    ? (pick ? ` data-geohero="${p.id}" title="${esc(msg('geoHeroT'))}"` : ` title="${esc(msg('geoTipPxs'))}"`)
    : ` data-geotip="${p.id}"`;
  if(hasGeo(p)){
    const place = geoPlace(p);
    const fl = `${flag(p.cc)}<span class="geo-name">${esc(place)}</span>`;
    /* 2.4: страну определил фон — метка тихая (data-geoauto), подсказка
       говорит правду: «определено по адресу», а не «вы указали» */
    const auto = p.ccAuto === true ? ' data-geoauto="1"' : '';
    return pick
      ? `<button type="button" class="geo-set"${auto}${hook} aria-label="${esc(msg('geoAriaSet', [place]))}">${fl}</button>`
      : `<span class="geo-set-ro"${auto}>${fl}</span>`;
  }
  return `<button type="button" class="geo-q${pick ? ' pick' : ''}"${hook} aria-label="${pick ? msg('geoAriaPick') : msg('geoUnk')}">`
       + `<span class="gq-box">${pick ? GQ_PLUS : ''}</span></button>`;
}

/* 2.1: тип отдельным чипом. Догадка (по порту) помечена звёздочкой и
   подсказкой — человек должен видеть, где факт, а где предположение. */
function typeInner(p){
  const type = normType(p.type);
  const guess = p.typeGuess === true;
  return `<span class="tp" data-pt="${type}" title="${esc(typeTip(p))}">${esc(typeLabel(type, guess))}</span>`;
}

function typeChip(p){
  return `<span class="chip typec">${typeInner(p)}</span>`;
}

function geoChip(p, hero){
  const head = geoHead(p, hero);
  const dot = hasGeo(p) ? '<span class="geo-dot">·</span>' : '';
  const chip = `<span class="chip">${head}${dot}${typeInner(p)}</span>`;
  if(hero) return chip;
  return `<span class="geo-wrap">${chip}${geoPickFor === p.id ? geoPickHtml(p) : ''}</span>`;
}

/* 2.4: метка места в строке списка — без рамки чипа, но той же высоты,
   чтобы строки не разъезжались. Кликается там, где страну можно менять
   руками (canPickGeo); у прокси из аккаунта — просто подпись. */
function geoBadge(p){
  return `<span class="geo-wrap">${geoHead(p)}${geoPickFor === p.id ? geoPickHtml(p) : ''}</span>`;
}

/* ── КАРТОЧКА ПРИ НАВЕДЕНИИ ────────────────────────────────
   Один узел на строку, создаётся по наведению и умирает вместе
   с ним. Живёт внутри .geo-wrap: перерисовка списка сносит её
   сама, следить за осиротевшими карточками не приходится.
   Держится, пока указатель на метке или на самой карточке, —
   иначе до кнопки внутри не дотянуться. */
let geoHintFor = null, geoHintT;
function geoHintText(p){
  /* 2.4: страну у своих прокси теперь ставит не только человек — её
     определяет фон (ccAuto). Подсказка обязана различать эти случаи:
     «вы указали» у автоматической страны было бы враньём. */
  if(hasGeo(p) && p.ccAuto === true) return canPickGeo(p) ? msg('geoTipAuto') : msg('geoTipPxs');
  /* этап 4: признак «страну отметил человек» не хранится отдельным полем —
     отметить её можно только у своих прокси, значит страна у своего и
     есть ручная отметка (форма схемы PROXY) */
  if(hasGeo(p) && canPickGeo(p)) return msg('geoTipSet');
  return canPickGeo(p) ? msg('geoTipMan') : msg('geoTipPxs');
}
function showGeoHint(el){
  const id = el.dataset.geotip;   /* этап 4: id — строка */
  if(geoHintFor === id || geoPickFor !== null) return;
  hideGeoHint(true);
  const p = proxies.find(x => x.id === id);
  const wrap = el.closest('.geo-wrap');
  if(!p || !wrap) return;
  geoHintFor = id;
  const card = document.createElement('div');
  card.className = 'geo-hint';
  card.innerHTML = `<p>${esc(geoHintText(p))}</p>` + (canPickGeo(p)
    ? `<button type="button" class="geo-hint-b" data-geopick="${p.id}">${PIN}${hasGeo(p) ? msg('geoChangeBtn') : msg('geoPickBtn')}</button>`
    : '');
  wrap.appendChild(card);
}
function hideGeoHint(now){
  clearTimeout(geoHintT);
  const kill = () => {
    geoHintFor = null;
    $$('.geo-hint').forEach(c => c.remove());
  };
  if(now) kill(); else geoHintT = setTimeout(kill, 160);
}
const PIN = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14.2s5-3.9 5-7.6a5 5 0 0 0-10 0c0 3.7 5 7.6 5 7.6Z"/><circle cx="8" cy="6.4" r="1.8"/></svg>';

/* ── ПОДСКАЗКА: один пузырь на страницу (7Е, решение человека 21.09) ──
   До 7Е у страницы механизма подсказок не было: DECISIONS 03.09 описывал
   его как CSS (псевдоэлемент носителя плюс data-tip-at), но правила в
   options.css не оказалось — ни в коде, ни в прототипе, и тексты
   tipHttps/tipSocks, tipConn*, naccTip, exportTip и ftAll не показывались.
   Теперь — по образцу попапа: узел #tip в конце body, текст из data-tip
   носителя, показ по наведению и фокусу, уход по уходу указателя, потере
   фокуса, прокрутке и Escape. Отличия от попапа: координаты от окна
   (position:fixed — страница прокручивается, контейнера с overflow нет) и
   сторона по data-tip-at носителя — «up»/«down» принудительно (иначе по
   свободному месту над носителем, как в попапе), «left»/«right» —
   прижим к левому или правому краю носителя (иначе остриё у центра, пузырь
   от него влево на 26px, как в попапе). Ширина — не шире самой длинной
   строки (7Л, правка человека 20.09: иначе при переносе справа пустота).
   Носители сейчас: «Экспорт» (exportTip, при поиске плюс ftAll), «Убрать
   дубликаты» и «Удалить всё» при поиске (ftAll), «нет в аккаунте»
   (naccTip), подпись «Соединение» замороженного блока #ping (скрыт) и
   скрытые кнопки HTTPS/SOCKS5 — пузырь общий, носителей он не знает. */
const tip = $('#tip');
let tipFor = null, tipT;
function showTip(el){
  const txt = el.dataset.tip;
  if(!txt){ if(tipFor) hideTip(); return; }   /* 7К.2 (Д-1): пустой data-tip гасит чужой пузырь, а не оставляет его висеть */
  if(el === tipFor) return;
  clearTimeout(tipT);
  tipFor = el;
  tip.textContent = txt;
  tip.hidden = false;
  tip.style.left = '0px';            /* мерим на свободном месте */
  tip.style.top = '0px';
  tip.style.width = '';
  /* пузырь не шире самой длинной строки: строки меряем прямоугольниками
     диапазона; одна строка — как есть (как в попапе, 7Л) */
  const rg = document.createRange(); rg.selectNodeContents(tip);
  const lines = typeof rg.getClientRects === 'function' ? [...rg.getClientRects()] : [];
  if(lines.length > 1){
    const cs = getComputedStyle(tip);
    const inner = Math.max(...lines.map(r => r.right)) - Math.min(...lines.map(r => r.left));
    tip.style.width = Math.ceil(inner + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) + 1) + 'px';
  }
  const PAD = 8, GAP = 9;
  const at = String(el.dataset.tipAt || '').split(/\s+/);
  const vw = document.documentElement.clientWidth;
  const er = el.getBoundingClientRect();
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  const cx = er.left + er.width / 2;
  let left = at.includes('left') ? er.left : at.includes('right') ? er.right - tw : cx - 26;
  left = Math.min(Math.max(left, PAD), Math.max(PAD, vw - tw - PAD));
  const up = at.includes('up') ? true : at.includes('down') ? false : (er.top - th - GAP >= PAD);   /* как в попапе: вверх, если помещается */
  tip.style.left = left + 'px';
  tip.style.top  = (up ? er.top - th - GAP : er.bottom + GAP) + 'px';
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
/* пузырь общий на страницу, поэтому ловим по общему признаку — любой
   элемент с data-tip; ушли с носителя на что угодно другое — прячем */
document.addEventListener('pointerover', e => {
  const q = e.target.closest?.('[data-tip]');
  if(q) showTip(q); else if(tipFor) hideTip();
});
document.documentElement.addEventListener('pointerleave', hideTip);
document.addEventListener('focusin',  e => { const q = e.target.closest?.('[data-tip]'); if(q) showTip(q); });
document.addEventListener('focusout', e => { if(e.target.closest?.('[data-tip]')) hideTip(); });
/* страница прокручивается — носитель уезжает, пузырь остался бы на месте */
window.addEventListener('scroll', hideTip, true);

/* строки списка стран — отдельной функцией: при наборе в поиске
   перерисовывается только она, а не весь список прокси. Иначе
   поле ввода теряло бы фокус на каждой букве */
function gpRows(p){
  const q = geoQuery.trim().toLowerCase();
  /* ищем и по названию на текущем языке, и по коду: «нид», «NL»
     и «neth» должны приводить к одному и тому же */
  const list = COUNTRIES.filter(c => !q
    || geoName(c[0]).toLowerCase().includes(q) || c[0].toLowerCase().includes(q));
  if(!list.length) return `<p class="gp-none">${msg('gpNone')}</p>`;
  /* название отдельным узлом: только так оно может забрать
     остаток ширины и обрезаться многоточием, не толкая код */
  list.sort((a, b) => geoName(a[0]).localeCompare(geoName(b[0]), uiLang));   /* 3Б.3: язык браузера вместо переменной lang */
  return list.map(c =>
    `<button class="gp-row${p.cc === c[0] ? ' on' : ''}" data-gset="${c[0]}">${flag(c[0])}<b>${esc(geoName(c[0]))}</b><i>${c[0]}</i></button>`).join('');
}
function geoPickHtml(p){
  return `<div class="geo-pick" role="dialog" aria-label="${msg('gpAria')}">
    <input class="gp-q" id="gpQ" placeholder="${msg('gpPh')}" aria-label="${msg('gpPh')}" spellcheck="false" autocomplete="off" value="${esc(geoQuery)}">
    <div class="gp-list">${gpRows(p)}</div>
    ${p.cc ? `<button class="gp-clear" data-gclear>${msg('gpClear')}</button>` : ''}
  </div>`;
}
/* Открыть выбор страны у конкретной строки: подвести к ней
   список, раскрыть и поставить курсор в поиск. Одним входом
   пользуются и герой, и стенд — раньше каждый делал это сам */
function openGeoPickAt(id){
  const p = proxies.find(x => x.id === id);
  if(!p || !canPickGeo(p)) return;
  goView('proxy');
  if(listTab !== 'list') setListTab('list');
  hideGeoHint(true);
  const i = visibleList().findIndex(x => x.id === id);
  if(!showAll && i > -1) page = Math.floor(i / PER_PAGE) + 1;
  geoPickFor = id; geoQuery = '';
  addingTagFor = null; editTagAt = null;
  renderList();
  $('#gpQ')?.focus();
  $(`.row[data-id="${id}"]`)?.scrollIntoView({ block:'nearest', behavior:'smooth' });
}

function closeGeoPick(){
  if(geoPickFor === null) return false;
  geoPickFor = null; geoQuery = '';
  return true;
}
function setGeo(cc){
  const p = proxies.find(x => x.id === geoPickFor);
  const c = CC_MAP[cc];
  /* 2.4: выбор человека снимает пометку «определено автоматически» вместе
     с городом: город был частью автоматического места, а страна теперь
     другая. Ручная страна главнее — geo.js её больше не тронет. */
  if(p && c){
    p.cc = c[0];
    delete p.ccAuto; delete p.city;
    persist();
  }   /* этап 4: в хранилище, без отдельного признака */
  closeGeoPick();
  renderList(); renderHero();
  if(c) toast(msg('geoMarked', [geoName(cc)]));
}

/* пропал из аккаунта: тихая пометка рядом со сроком. Цветом не
   поднимаем — это факт, а не тревога */
function naccMark(p){
  return p.gone ? `<span class="nacc" data-tip="${esc(msg('naccTip'))}" tabindex="0">${msg('naccT')}</span>` : '';
}

function copyVal(el, text){
  if(!text) return;
  const done = () => {
    el.classList.add('hit');
    setTimeout(() => el.classList.remove('hit'), 900);
    toast(msg('copied'));
  };
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done);
  else done();
}

/* Размер IP фиксированный и от контента не зависит: запас
   рассчитан под самый длинный IPv4 (255.255.255.255) на любой
   ширине. Для аномально длинных адресов — второй фиксированный
   ярус по длине строки, без измерений и подгонок. */
function setIp(text){
  const el = $('#stIp');
  el.classList.toggle('long', text.length > 15);
  el.textContent = text;
}

/* ── ЧЕГО МЫ НЕ УЗНАЁМ ПРИ ВЫХОДЕ ──────────────────────────
   Здесь была функция, добывавшая внешний адрес — тот, который
   видят сайты. Она ушла вместе с самим блоком: спросить этот
   адрес не у кого. Нужна страница, которая отразит запрос
   обратно, а её нет и не будет; подставлять вместо неё адрес
   прокси из настроек бессмысленно — он покажется одинаково,
   работает прокси или мёртв.
   По той же причине расширение не определяет страну выхода:
   она приходит только по ключу API или ставится вручную
   (см. комментарий к hasGeo в format.js). */

/* 3Б.3: здесь стоял отменённый индикатор качества соединения (решение
   29.08, промт 3Б.3 «не переносить»): пороги CONN_GOOD/CONN_MID/CONN_MIN
   с комментарием «УРОВЕНЬ СОЕДИНЕНИЯ» (медиана замеров, меньше трёх —
   уровня нет), флаг SHOW_MS с комментарием «ЗАМОРОЖЕНО: показ отклика
   числом», connLevel() и пара startVisits()/stopVisits() с таймером
   visitT, подкапливавшая выдуманные замеры случайными числами.
   Ключи cqGood/cqMid/cqSlow/cqMs в словаре оставлены замороженными —
   их описание при ключах в messages.json. */


/* ════════ СЦЕНА КОННЕКТОРА ════════
   Четыре комплекта отрисовки — база, согласование, подключено,
   ошибка. Каждый комплект это панель плюс коннектор; между
   собой они согласованы по координатам, поэтому подмена
   комплекта ничего не сдвигает.

   ГЕОМЕТРИЯ вычислена из самих файлов, не подобрана на глаз:
   · пины коннектора      x 152.57…173.07, y 19.9 / 34.7 / 49.6
   · гнёзда панели        x 17.01,         y 70.5 / 85.3 / 100.2
   отсюда вертикаль панели −47.5 и сдвиг холста коннектора
   (25.25, 3) — у отрисовки без маски свой холст 174×68, у
   маски 190×74.

   ЧТО СЧИТАЕТСЯ НА ЛЕТУ. Кадр (viewBox) зависит от размера
   блока: высота блока задана вёрсткой героя, ширина резиновая.
   Поэтому viewBox пересчитывается под фактическую пропорцию,
   а правый край кадра всегда сидит на правом крае панели —
   между ними не должно появляться полосы фона. */
const CQ = {
  PANEL_W : 82,      /* ширина панели в единицах холста */
  PANEL_H : 169,     /* её высота */
  PX0     : 170,     /* опорная посадка: при ней коннектор в нуле */
  SHIFT_X : 25.25,   /* холст без маски → холст маски */
  SHIFT_Y : 3,
  WIRE_END: 30,      /* докуда тянуть линию провода: её конец всегда под корпусом */
};
const cqScene = $('#cqScene');
let cqState = 'base', cqMoveT;

/* Читаем настройки из CSS-переменных блока: править их удобнее
   там, рядом с описанием, чем искать числа в скрипте. */
function cqVar(name, def){
  const v = getComputedStyle($('.power')).getPropertyValue(name).trim();
  return v === '' ? def : parseFloat(v);
}

function cqLayout(){
  if(!cqScene) return;
  const box = cqScene.getBoundingClientRect();
  /* до первой раскладки размеров ещё нет — пробуем на следующем
     кадре, иначе сцена осталась бы без viewBox и не нарисовалась */
  if(!box.width || !box.height){
    /* 3Б.5: сцена в скрытом разделе (открыты «Настройки» или «Помощь»)
       размера не получит, и повтор по кадрам крутился бы до возврата.
       Не отображается — выходим; по возврату пересчёт даст ResizeObserver */
    if(cqScene.offsetParent !== null) requestAnimationFrame(cqLayout);
    return;
  }
  const px  = cqVar('--cq-panel-x', 170);
  const pad = cqVar('--cq-pad', 15);
  const py  = cqVar('--cq-py', -47.5);
  /* Воздух добавляет высоты кадру, ширина идёт за пропорцией
     блока, а правый край стоит на правом крае панели: кадр
     растёт только влево, и от правой стены сцена не отходит. */
  let h = (CQ.PANEL_H + pad * 2) / cqVar('--cq-zoom', 1);
  let w = h * (box.width / box.height);
  /* Ширина кадра не опускается ниже CQ_WMIN. Кадр строится от
     пропорции кнопки, и на узкой высокой кнопке он выходил
     настолько узким, что сцена раздувалась: коннектор наезжал
     на подпись, а провод слева уходил за кромку. Упёршись в
     пол, кадр дальше растёт по высоте — сцена мельчает и
     набирает воздух сверху и снизу, но целиком остаётся в кадре
     при любой пропорции. Ради этого кнопку и можно тянуть по
     высоте блока, не сверяясь со сторонами. */
  const wmin = cqVar('--cq-wmin', 285);
  if(w < wmin){ w = wmin; h = w / (box.width / box.height); }
  /* панель держится по центру кадра при любой его высоте: pad
     описывал воздух только для случая h = PANEL_H + 2·pad */
  const x = px + CQ.PANEL_W - w, y = py - (h - CQ.PANEL_H) / 2;
  const vb = x + ' ' + y + ' ' + w + ' ' + h;
  $$('.cq svg').forEach(v => v.setAttribute('viewBox', vb));
  $$('.cq-pnw').forEach(g => g.setAttribute('transform', 'translate(' + px + ' ' + py + ')'));
  $$('.cq-shift').forEach(g => g.setAttribute('transform', 'translate(' + CQ.SHIFT_X + ' ' + CQ.SHIFT_Y + ')'));
  /* масштаб нужен, чтобы перевести ход коннектора из единиц
     холста в пиксели: двигаем обёртку, а она живёт в пикселях */
  const k = box.width / w;
  cqScene.style.setProperty('--cq-k', k);
  const wire = $('.cq-wire');
  if(wire){
    wire.style.setProperty('--cq-wire-w', Math.max(0, (CQ.WIRE_END - x) * k) + 'px');
    wire.style.setProperty('--cq-wire-y', ((34.3 + CQ.SHIFT_Y - (y + h / 2)) * k - 1.2) + 'px');
  }
  cqApplyMove();
}

/* Ход коннектора. Точка стыковки едет вместе с панелью —
   значит коннектор дойдёт до пинов, где бы гнездо ни стояло,
   а отвод отсчитывается от неё, а не от нуля холста. */
function cqOffset(st){   /* этап 4: расчёт вынесен из cqApplyMove — нужен и cqCurrentOffset, как в попапе */
  const dock = (cqVar('--cq-panel-x', 170) - CQ.PX0) + cqVar('--cq-seat', 0);
  const gap  = cqVar('--cq-gap', 32);
  return st === 'on'   ? dock
       : st === 'busy' ? dock - gap * 0.34
       : dock - gap;
}
function cqApplyMove(){
  const off = cqOffset(cqState);
  /* внутри svg пиксель равен пользовательской единице, поэтому
     сдвиг ставится прямо в единицах холста — пересчёт не нужен */
  $$('.cq-cn').forEach(el => el.style.transform = 'translateX(' + off + 'px)');
}

/* Где коннектор видимого комплекта СЕЙЧАС — с учётом идущего хода.
   Этап 4: фон отвечает за десятки миллисекунд, и состояния сменяют друг
   друга быстрее, чем коннектор доезжает (ход 1,05 с). Приходящий комплект
   обязан стартовать из точки, где коннектор находится на самом деле, а не
   из своей прошлой точки — иначе при первом включении он появлялся у
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

/* Подмена комплекта. Невидимые держим display:none — при
   opacity:0 браузер всё равно тратит на них такт. Нужный
   включаем на кадр раньше, иначе переход стартует с display
   и кроссфейда не будет. */
function cqSet(next){
  if(!cqScene || next === cqState) return;
  const prev = cqState;
  cqState = next;
  cqScene.dataset.cs = next;
  /* приходящий комплект ставим туда, где стоит уходящий, гасим переход
     на один кадр и только потом отпускаем — иначе он появился бы в своей
     прошлой точке, а уходящий ещё в пути (этап 4) */
  const cur = cqCurrentOffset(prev);
  const fresh = $$('.cq-set[data-k="' + next + '"] .cq-cn');
  fresh.forEach(el => {
    el.style.transition = 'none';
    el.style.transform  = 'translateX(' + cur + 'px)';
  });
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
   памяти у неё нет, иначе они разошлись бы при первом же
   обрыве. */
function cqSync(){
  const pw = power();
  cqSet(heroError() ? 'err'
      : (pw === 'busy' || reconn) ? 'busy'
      : pw === 'on' ? 'on' : 'base');
}

if(cqScene){
  /* первый комплект показываем без перехода */
  /* у <svg> нет свойства hidden — только атрибут: свойство
     живёт у HTMLElement, и присваивание ему молча не сработало бы */
  $$('.cq-set').forEach(el => { if(el.dataset.k === 'base'){ el.removeAttribute('hidden'); el.classList.add('on'); } });
  cqLayout();
  /* Первый замер часто приходит до того, как блок получил
     окончательный размер: шрифты ещё грузятся, раскладка ещё
     не устоялась. ResizeObserver ловит изменение, но если
     размер не менялся — второго вызова не будет, и сцена
     останется с прикидочным кадром. Поэтому пересчитываем ещё
     раз по загрузке и один раз с задержкой. */
  window.addEventListener('load', cqLayout);
  setTimeout(cqLayout, 300);
  if(window.ResizeObserver) new ResizeObserver(cqLayout).observe(cqScene);
  else window.addEventListener('resize', cqLayout);
}

/* ── рендер: герой ──────────────────────────────────────── */
const eyeOn  = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.6 8s2.3-4.3 6.4-4.3S14.4 8 14.4 8s-2.3 4.3-6.4 4.3S1.6 8 1.6 8Z"/><circle cx="8" cy="8" r="2"/></svg>`;
const eyeOff = iconEyeOff(16);   /* 3Б.6: из icons.js; тот же глаз в настройках — I.eyeoff, 17×17 */

/* Плашка иконки помечает смену состояния одной короткой
   вспышкой. Не постоянная анимация: блок висит перед глазами,
   и вечное движение в нём раздражало бы. */
let heroPowerWas = null, icPopT;
function icPop(){
  const el = $('.cn-ic');
  if(!el) return;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  clearTimeout(icPopT);
  icPopT = setTimeout(() => el.classList.remove('pop'), 500);
}

/* 7К.2 (Е-3): адрес с портом в строке списка (.r-addr) — IPv6 в квадратных
   скобках, если в адресе есть «:» (IPv4 и имена — без изменений), как в
   экспорте и PAC; всё через esc() */
const addrHtml = p => `${esc(String(p.ip).includes(':') ? '[' + p.ip + ']' : p.ip)}<span class="dt">:</span><span class="pt">${esc(p.port)}</span>`;

function renderHero(){
  cqSync();   /* отрисовка коннектора идёт следом за состоянием */
  const p = active(), hero = $('#hero');
  const lbl = $('#pLabel');

  /* Подсветка панели держится на том, что список пуст, а не на
     отсутствии активного прокси: при непустом списке звать
     «добавьте» незачем — там нужно просто выбрать строку. */
  document.body.classList.toggle('no-proxy', !proxies.length);
  /* Имя переключателя задаётся явно. Раньше его давала видимая
     подпись «Включить» — она же была и действием. Теперь подпись
     называет состояние, и без aria-label скринридер прочитал бы
     «Выключено, переключатель, выключен» — состояние дважды и ни
     слова о том, чем управляем. 7К.2 (Д-9): до ветки пустого списка —
     подпись переводится и при пустом списке, а не остаётся из разметки */
  $('#btnPower').setAttribute('aria-label', msg('pwrAria'));

  if(!p){
    hero.dataset.power = 'off';
    document.body.classList.remove('lit');
    $('#stIp').classList.remove('long');
    hero.dataset.empty = '';
    $('#stIp').innerHTML = `<span style="color:var(--mut-2)">${msg('addAddr')}</span>`;
    /* указатель занимает место плашек: строка не пустует, и
       колонка встаёт по середине блока сама, без подпорок */
    $('#stChips').innerHTML =
      `<span class="empty-arrow" aria-hidden="true">`
      + `<svg width="26" height="26" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`
      + `<path d="M8 2.4v11.2"/><path d="m3.2 8.8 4.8 4.8 4.8-4.8"/></svg></span>`;
    $('#stMode').hidden = true;
    $('#btnHeroEdit').hidden = true;
    $('#vLoginT').textContent = '—'; $('#vPassT').textContent = '—';
    $('#vLogin').disabled = $('#vPass').disabled = true;
    $('#btnPower').disabled = $('#btnCheck').disabled = true;
    $('#btnEye').style.visibility = 'hidden';
    lbl.textContent = msg('pwrOn');
    renderConn();
    return;
  }

  delete hero.dataset.empty;
  const pw = power();   /* этап 4: выводится из st.enabled, busy и reconn */
  hero.dataset.power = pw;
  document.body.classList.toggle('lit', pw === 'on');
  $('#btnPower').disabled = false;
  $('#btnPower').setAttribute('aria-busy', pw === 'busy' || reconn);
  $('#btnPower').setAttribute('aria-checked', pw === 'on');
  $('#btnCheck').disabled = false;
  $('#btnCheck').hidden = !(CHECKERS.hero && canCheck(p));
  $('#vLogin').disabled = !p.login; $('#vPass').disabled = !p.pass;

  /* отказ — срыв включения или авто-отключение: герой коротко
     горит красным. Слова у отказа больше нет: строка статуса
     ушла в кнопку, причину объявляет тост. Этап 4: сюда же попадает
     state.lastError, пока прокси включён, — держится, пока фон его не снимет */
  if(heroError()) hero.dataset.power = 'err';
  /* Состояние соединения теперь живёт только в кнопке: она же
     переключатель, она же индикатор. Дублировать его строкой
     над адресом значило бы спорить с самим собой. */
  /* 7Л: метка режима — «Чёрный список: N» / «Белый список: N» (N — строк в
     поле выбранного списка), при 'off' строки нет */
  const lf = listField(settings.listMode);
  $('#stMode').hidden = !lf;
  if(lf) $('#stMode').innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2.8 8.6 3.4 3.4 7-7.6"/></svg>' + msg(settings.listMode === 'black' ? 'lmBlack' : 'lmWhite', [String(listCount(settings[lf]))]);
  /* Три состояния, четвёртого нет: смена прокси на лету — то же
     подключение, отдельного слова ей не нужно. */
  lbl.textContent = (reconn || pw === 'busy') ? msg('pwrBusy') : pw === 'on' ? msg('pwrOff') : msg('pwrOn');   /* 7В: «занято» и проверкой при подключении — та же подпись */

  /* порт в герое не показываем — он живёт в списке */
  setIp(p.ip);

  $('#stChips').innerHTML = geoChip(p, true);
  $('#btnHeroEdit').hidden = false;
  if(p.exp && expDays(p) <= EXP_WARN_DAYS){
    const ed = expDays(p);
    $('#stChips').insertAdjacentHTML('beforeend', ed < 0
      ? `<button class="chip expch bad" id="heroExp" title="${msg('expiredClickT')}">${ICON_WARN}${msg('expired')}</button>`
      : `<button class="chip expch${ed <= EXP_BAD_DAYS ? ' bad' : ''}" id="heroExp" title="${expLabel(ed)} — ${msg('expClickRenew')}">${ICON_CLOCK}${expShort(ed)}</button>`);
  }

  $('#vLoginT').textContent = p.login || '—';
  const masked = settings.mask;
  /* Точек ровно столько, сколько влезает в плашку, а не по одной
     на знак. Длина пароля всё равно не читается по точкам, зато
     маска из тридцати штук выезжала за плашку и упиралась в
     кромку блока. В списке прокси ограничение стоит с самого
     начала — здесь его просто не было. */
  $('#vPassT').textContent  = p.pass ? ((showPass || !masked) ? p.pass : '•'.repeat(Math.min(p.pass.length, 5))) : '—';
  $('#btnEye').style.visibility = (p.pass && masked) ? 'visible' : 'hidden';
  $('#btnEye').innerHTML = showPass ? eyeOff : eyeOn;
  $('#btnEye').setAttribute('aria-pressed', showPass);
  /* этап 9 (проход Г, п. 4): имя кнопки-переключателя постоянное, состояние — aria-pressed
     (было: имя менялось showPass ↔ hidePass вместе с aria-pressed — диктор читал «Скрыть пароль, нажато»);
     подсказка title по-прежнему называет действие */
  $('#btnEye').setAttribute('aria-label', msg('showPass'));
  $('#btnEye').title = showPass ? msg('hidePass') : msg('showPass');

  renderConn();
  if(hero.dataset.power !== heroPowerWas){
    if(heroPowerWas !== null) icPop();
    heroPowerWas = hero.dataset.power;
  }
}

/* Насколько молния налита цветом. Единицы — пользовательское
   пространство SVG: 0 полная, 44 пустая. Три уровня и пустота,
   промежуточных значений нет — оценка дискретная, и притворяться
   плавной шкалой ей незачем. */
const BOLT_FILL = { good:0, mid:32, slow:51, ok:75, busy:75, off:75, lost:75 };

/* Пять состояний плюс две технические фазы.
   «Работает» — проверка прошла, но человек ещё никуда не ходил;
   сюда же попадает случай «проверка не прошла, страниц не
   открывали»: это не ошибка и не повод для тревожного цвета,
   причин может быть несколько и мы не знаем какая.
   «Отключено» — человек выключил прокси сам, отсюда спящий
   значок. Обрыв — это НЕ «Отключено»: первое он выбрал, второе
   с ним случилось, и путать их нельзя. Обрыв показывает блок
   питания, здесь он остаётся тихим «Нет соединения» без сна. */
function renderConn(flash){
  const box = $('#ping'), p = active();
  let q, word;   /* 3Б.3: переменной ms нет вместе с SHOW_MS */
  if(!p){ q = 'off'; word = msg('cqOff'); }
  else if(power() === 'busy' || reconn || checking.has(p.id)){
    q = 'busy'; word = reconn ? msg('stSwitch') : msg('stBusy');   /* 7В: проверка при подключении — то же слово, что ожидание фона */
  }
  else if(power() !== 'on' || heroError()){
    q = heroError() ? 'lost' : 'off';
    word = heroError() ? msg('cqLost') : msg('cqOff');
  }
  else {
    /* 3Б.3: уровня нет — connLevel() и замеры не перенесены (индикатор
       качества отменён): включённое соединение всегда «Работает». В
       прототипе здесь стояла ветка good/mid/slow с cqMs(lv.ms). */
    q = 'ok'; word = msg('cqOk');
  }
  box.dataset.q = q;
  const ico = $('#cqIco');
  ico.style.setProperty('--fill', BOLT_FILL[q] + 'px');
  $('#cqWord').textContent = word;
  $('#cqZzz').hidden = q !== 'off';
  /* Ветка «ok» вела на tipConnOk — «Соединение проверено, оценка
     появится, когда вы откроете несколько страниц». Оценки нет:
     индикатор качества отменён, показывать рейтинг негде. Строка
     убрана из обоих словарей, состояние падает на общую
     подсказку. */
  $('#ping .lbl').dataset.tip =
    q === 'off'  ? msg('tipConnOff')  : q === 'lost' ? msg('tipConnLost') :
    q === 'busy' ? msg('tipConnBusy') : msg('tipConn');
  /* 3Б.3: строки «if(SHOW_MS) $('#cqWord').title = ms» нет — флаг не перенесён */
  /* вспышка однократная и только на обновление уровня */
  if(flash){ ico.classList.remove('spark'); void ico.offsetWidth; ico.classList.add('spark'); }
}

/* ── рендер: список ─────────────────────────────────────── */
/* 3Б.3: шестерёнка gear, константы CLK/TRI/ARR, палитры TAG_COLORS и
   TAG_COLORS_LIGHT с tagStyle(), plural(), expDays(), expLabel(),
   expShort() и isExpired() отсюда ушли в src/shared/ (icons.js: ICON_GEAR,
   ICON_CLOCK, ICON_WARN, ICON_ARROW; format.js — остальное) и
   импортируются сверху. Русскую plural() заменил Intl.PluralRules внутри
   msgN(). expDays считает календарные дни от местной полуночи, а не
   Math.ceil от Date.now() — единственное изменение поведения (3Б.1). */
function expChip(p){
  if(!p.exp) return '';
  const d = expDays(p);
  if(d < 0) return `<button class="chip expch bad" data-renew="${p.id}" title="${msg('expiredRenewT')}">${ICON_WARN}${msg('expired')} · <span class="rn">${msg('renew')}${ICON_ARROW}</span></button>`;
  if(d > EXP_WARN_DAYS) return '';
  return `<span class="chip expch${d <= EXP_BAD_DAYS ? ' bad' : ''}" title="${msg('renewFromMenu')}">${ICON_CLOCK}${expLabel(d)}</span>`;
}

/* 3Б.6: proxyHay — из format.js, одна на оба окна (в попапе была своя
   копия); пояснение, почему в строку не входит пароль, — там */
let query = '';

/* видимый список: в порядке добавления, отфильтрованный поиском и типом
   (2.1). Сортировку сняли — если вернётся, встанет сюда */
function visibleList(){
  const q = query.trim().toLowerCase();
  let out = q ? proxies.filter(p => proxyHay(p).includes(q)) : [...proxies];
  if(typeFilter !== 'all') out = out.filter(p => normType(p.type) === typeFilter);
  return out;
}

/* 2.1: фильтр по типу. 'all' — весь список. Считается по ВСЕМУ списку, а
   не по найденному: иначе счётчик типа скакал бы от поиска и фильтр было бы
   не на что нажать. */
let typeFilter = 'all';

function typeCounts(list){
  const out = {};
  for(const t of PROXY_TYPES) out[t] = 0;
  for(const p of list) out[normType(p.type)] = (out[normType(p.type)] || 0) + 1;
  return out;
}

function renderTypes(){
  const box = $('#lTypes');
  if(!box) return;
  if(!proxies.length){ box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  const c = typeCounts(proxies);
  /* 2.3 (просьба человека 19.10): все четыре типа видны ВСЕГДА, даже с нулём.
     Раньше пустые категории прятались, и SOCKS4 исчезал из фильтра, пока не
     появится первый прокси этого типа — со стороны это выглядело как
     «в расширении нет SOCKS4». Пустая категория показана приглушённо и не
     нажимается, но она на месте: видно, что тип поддерживается. */
  const one = (key, label, n) => {
    const empty = key !== 'all' && !n;
    return `<button type="button" data-ltype="${key}" aria-pressed="${typeFilter === key}"`
      + (empty ? ' data-empty="1" aria-disabled="true"' : '') + `>${label}<b>${n}</b></button>`;
  };
  /* выбранный тип исчез из списка (удалили последнюю запись) — возвращаем «Все» */
  if(typeFilter !== 'all' && !c[typeFilter]) typeFilter = 'all';
  /* 2.1: у каждой категории — подпись типа и число адресов; у активного
     прокси это ещё и его категория, поэтому строка списка и фильтр говорят
     об одном и том же одним словом. */
  box.innerHTML = one('all', msg('lTypeAll'), proxies.length)
    + PROXY_TYPES.map(t => one(t, t, c[t])).join('');
}

/* пустой результат после фильтра: поиск ни при чём — нужен сброс фильтра */
$('#lTypes')?.addEventListener('click', e => {
  const b = e.target.closest('[data-ltype]'); if(!b) return;
  if(b.dataset.empty) return;   /* 2.3: пустая категория видна, но не нажимается */
  typeFilter = b.dataset.ltype === 'all' ? 'all' : normType(b.dataset.ltype);
  page = 1;
  renderList();
});

function rowEditHtml(p){
  const d = editDraft;
  /* Недоступные типы гасятся и здесь. Иначе строку, заведённую
     до запрета, можно было бы переключить на HTTPS правкой —
     форма добавления его не отдаёт, а редактирование отдавало.
     7Е (решение человека 15.09, ответ проверяющего чата 21.09): как в
     форме добавления — одна подпись «HTTP / HTTPS», все три кнопки
     скрыты (hidden; код segBtn и подсказки остаются — SOCKS5 возможен для
     заказов с авторизацией по IP), тип в запись уходит литералом 'HTTP'
     (saveEdit), из кнопок он больше не берётся */
  /* 2.1: кнопки типов больше не скрыты — тип записи можно сменить правкой.
     Подсказка одна: SOCKS5 не принимает логин и пароль от Chrome. */
  const segBtn = t => {
    const tip = t === 'SOCKS5' ? ` data-tip="${esc(msg('tipSocks'))}"` : '';
    return `<button type="button" data-edtype="${t}" aria-pressed="${d.type === t}"${tip}>${t}</button>`;
  };
  /* 3Б.5: адрес и порт в .r-addr — через esc(), как в попапе (аудит,
     проход Б). Ручные пути отфильтрованы регуляркой, прокси по ключу
     и перенесённые на этапе 8 — нет. 7К.2 (Е-3): адрес — addrHtml */
  return `
    <div class="row edit ${p.id === activeProxyId ? 'on' : ''}" data-id="${p.id}">
      <span class="ring" aria-hidden="true"></span>
      <span class="r-addr">${addrHtml(p)}</span>
      <span class="r-end1"><span class="ed-cap">${msg('editing')}</span></span>
      <div class="ed">
        <div class="ed-g">
          <input class="finp ed-inp" id="edIp"    data-ed="ip"    value="${esc(d.ip)}"    spellcheck="false" autocomplete="off" placeholder="${msg('phAddr')}" aria-label="${msg('ariaAddr')}">
          <input class="finp ed-inp" id="edPort"  data-ed="port"  value="${esc(d.port)}"  inputmode="numeric" maxlength="5" autocomplete="off" placeholder="${msg('phPort')}" aria-label="${msg('ariaPort')}">
          <input class="finp ed-inp" id="edLogin" data-ed="login" value="${esc(d.login)}" spellcheck="false" autocomplete="off" placeholder="${msg('phLogin')}" aria-label="${msg('lblLogin')}">
          <input class="finp ed-inp" id="edPass"  data-ed="pass"  value="${esc(d.pass)}"  spellcheck="false" autocomplete="off" placeholder="${msg('phPass')}" aria-label="${msg('lblPass')}">
        </div>
        <div class="ed-b">
          <div class="seg sm" id="segEd">${PROXY_TYPES.map(segBtn).join('')}</div>
          <span class="ed-sp"></span>
          <button class="btn-acc sm" data-edsave>${msg('save')}</button>
          <button class="btn-ft" data-edcancel>${msg('cancel')}</button>
        </div>
      </div>
    </div>`;
}

/* 2.4: состояние строки одним словом — «Connected» зелёным или
   «Disconnected» красным, как в таблицах чекеров.
   Подключена та строка, которая активна И прокси включён: активная запись
   при выключенном прокси — это «выбрана», а не «подключена», и врать про
   это нельзя. Кнопка не декоративная: клик по зелёной отключает прокси,
   клик по красной подключает именно эту строку (переключение + включение).
   Пока идёт применение (st.probing), слово меняется на «Connecting…». */
function connPill(p){
  const active = p.id === activeProxyId;
  const on = active && st.enabled;
  /* «Подключение…» — только пока идёт сам клик (ответ фона или пауза
     расстыковки). Проверка соединения в фоне (st.probing) сюда не
     входит: при ней прокси уже подключён, и метка обязана быть зелёной —
     иначе зелёный цвет появлялся бы через секунды после включения. */
  const pending = active && !on && (busy || reconn);
  if(pending){
    return `<button type="button" class="r-conn off busy" data-conn="${p.id}"
                    title="${esc(msg('connOnTip'))}" aria-label="${esc(msg('connBusy'))}"
                    aria-pressed="false"><i class="cd"></i><span class="lbl"><span class="l-idle">${esc(msg('connBusy'))}</span></span></button>`;
  }
  /* 2.4.1: в покое метка называет состояние, под указателем — действие,
     которое сделает клик. Подключённая строка читается «Connect»
     (зелёная), при наведении — «Disconnect» (красная); отключённая —
     «Disconnected» (красная), при наведении «Connect» (зелёная).
     Обе подписи лежат в одной ячейке сетки, поэтому ширина метки не
     прыгает, а невидимая подпись не попадает в innerText и в озвучку. */
  const idle = on ? msg('connOn') : msg('connOff');
  const action = on ? msg('connCut') : msg('connOn');
  const tip = on ? msg('connOffTip') : msg('connOnTip');
  return `<button type="button" class="r-conn ${on ? 'on' : 'off'}" data-conn="${p.id}"
                  title="${esc(tip)}" aria-label="${esc(action + ' — ' + tip)}"
                  aria-pressed="${on ? 'true' : 'false'}"><i class="cd"></i><span class="lbl"><span class="l-idle">${esc(idle)}</span><span class="l-hover">${esc(action)}</span></span></button>`;
}

function rowHtml(p){
  if(p.id === editId) return rowEditHtml(p);
  const tags = p.tags.map((t, i) =>
    editTagAt && editTagAt.id === p.id && editTagAt.i === i
      ? `<input class="tag-inp" id="tagInp" maxlength="${TAG_LEN}" value="${esc(t)}" aria-label="${msg('tagPh')}" spellcheck="false" autocomplete="off">`
      : `<span class="chip tagc" style="${tagStyle(t)}" data-tagedit="${p.id}|${i}" role="button" tabindex="0" title="${msg('tagEditT')}">#${esc(t)}<button class="untag" data-untag="${p.id}|${i}" aria-label="${msg('tagRemove', [esc(t)])}"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="m1.5 1.5 5 5M6.5 1.5l-5 5"/></svg></button></span>`).join('');
  const adder = addingTagFor === p.id
    ? `<input class="tag-inp" id="tagInp" maxlength="${TAG_LEN}" placeholder="${msg('tagPh')}" aria-label="${msg('tagPh')}" spellcheck="false" autocomplete="off">`
    : `<span class="chip add" role="button" tabindex="0" data-addtag="${p.id}">${msg('tagAdd')}</span>`;
  /* 3Б.5: адрес и порт — в aria-label и в .r-addr — через esc(),
     как остальные вставки строки (аудит, проход Б). 7К.2 (Е-3): одна
     подстановка hostPort(p) — IPv6 в квадратных скобках, как в экспорте и PAC */
  return `
    <div class="row ${p.id === activeProxyId ? 'on' : ''}" data-id="${p.id}" role="button" tabindex="0"
         aria-label="${p.id === activeProxyId ? msg('rowActive', [esc(hostPort(p))]) : msg('switchTo', [esc(hostPort(p))])}">
      <span class="ring" aria-hidden="true"></span>
      <span class="r-addr">${addrHtml(p)}</span>
      <span class="r-geo">${geoBadge(p)}</span>
      <span class="r-end1">
        ${rcheckHtml(p)}
      </span>
      <span class="r-meta">
        ${typeChip(p)}${expChip(p)}${naccMark(p)}${tags}${adder}
      </span>
      <span class="r-tools mwrap">
        ${connPill(p)}
        <button class="ico" data-menu="${p.id}" aria-haspopup="menu" aria-expanded="false" aria-label="${msg('rowMenu')}">${ICON_GEAR}</button>
        <div class="menu" role="menu" hidden>
          <button role="menuitem" data-copy="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5.6" y="5.6" width="8" height="8" rx="1.8"/><path d="M10.4 5.6V3.8c0-.8-.6-1.4-1.4-1.4H3.8c-.8 0-1.4.6-1.4 1.4v5.2c0 .8.6 1.4 1.4 1.4h1.8"/></svg>
            ${msg('miCopy')}
          </button>
          <button role="menuitem" data-tcheck="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.8 13.4 4v4.1c0 3.4-2.3 5.6-5.4 6.7-3.1-1.1-5.4-3.3-5.4-6.7V4z"/><path d="m5.6 8.1 1.7 1.7 3.2-3.4"/></svg>
            ${msg('miTypeCheck')}
          </button>
          ${p.cc ? '' : `<button role="menuitem" data-geoone="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M1.9 8h12.2"/><path d="M8 1.8c2.1 2 2.1 10.4 0 12.4M8 1.8c-2.1 2-2.1 10.4 0 12.4"/></svg>
            ${msg('miGeo')}
          </button>`}
          <button role="menuitem" data-edit="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9.9 2.9 3.2 3.2-7.5 7.5-3.4.7.7-3.4z"/><path d="m8.7 4.1 3.2 3.2"/></svg>
            ${msg('miEdit')}
          </button>
          ${(!p.exp || p.src === 'manual') ? '' : `
          <button role="menuitem" data-renew="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.2" y="3.4" width="11.6" height="10" rx="1.8"/><path d="M5.2 1.8v2.4M10.8 1.8v2.4M2.2 6.6h11.6"/><path d="m6.4 10.3 1.5 1.5 2.7-2.9"/></svg>
            ${msg('renew')}
          </button>`}
          <button role="menuitem" class="danger" data-del="${p.id}">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.2h11"/><path d="M6.3 4.2V2.8h3.4v1.4"/><path d="m4.2 4.2.6 9.8h6.4l.6-9.8"/><path d="M6.6 7v4.3M9.4 7v4.3"/></svg>
            ${msg('miDel')}
          </button>
        </div>
      </span>
    </div>`;
}

/* инлайн-чекер строки: покой → крутится → результат.
   Результат хранится в общем pings, поэтому блок соединения и
   строка списка всегда говорят одно и то же.
   Колонка называется состоянием, а не пингом: она отвечает, жив
   адрес или нет, и скорости в ней больше нет. */
function rcheckHtml(p){
  /* ЗАМОРОЖЕНО: пусто, пока не поднят CHECKERS.row.
     .r-end1 остаётся в разметке — колонка схлопывается в ноль,
     сетка строки не перестраивается, возврат ничего не двигает */
  if(!CHECKERS.row || !canCheck(p)) return '';
  if(checking.has(p.id))
    return `<span class="rcheck busy"><i class="spin"></i>${msg('rcBusyA')}<span class="chk-lg">${msg('rcBusyB')}</span></span>`;
  const v = pings[p.id];
  if(v === undefined)
    return `<button class="rcheck" data-check="${p.id}">${msg('rcChkA')}<span class="chk-lg">${msg('rcChkB')}</span></button>`;
  if(v === 'exp')
    return `<button class="rcheck bad" data-renew="${p.id}" title="${msg('renew')}"><i class="rdot"></i>${msg('errExp')}</button>`;
  if(v === 'dead')
    return `<button class="rcheck bad" data-check="${p.id}" title="${msg('chkAgain')}"><i class="rdot"></i>${msg('rcNoConn')}</button>`;
  if(v === 'auth')
    return `<button class="rcheck bad" data-fix="${p.id}" title="${msg('fixTitle')}"><i class="rdot"></i>${msg('wrongCreds')}</button>`;
  /* Число заменено словом. Оно попадало под то же решение, что и
     крупный отклик в блоке соединения: миллисекунды сравнивают с
     пингом из VPN-клиента, где это расстояние до сервера, а у нас
     время ответа страницы ЧЕРЕЗ прокси — оно всегда больше, и
     адрес на этом фоне выглядит медленным.
     Градация ok/mid/slow ушла вместе с числом: она делила по
     скорости, а колонка теперь отвечает на другой вопрос — жив
     адрес или нет. Отказы ниже по-прежнему разные, и это главное:
     «не отвечает», «неверные данные» и «истёк» требуют разных
     действий, поэтому у каждого свой текст и своя кнопка. */
  return `<button class="rcheck ok" data-check="${p.id}" title="${msg('chkAgain')}"><i class="rdot"></i><b>${msg('cqOk')}</b></button>`;
}

/* 3Б.3: функции failKind() нет — она случайным числом прототипа (отказ по
   авторизации в 45 % случаев) выбирала 'auth' или 'dead' и в расширении
   давала бы случайные отказы
   исправных прокси (решение 01.09). Отказ ставится только по сроку:
   isExpired(p) → 'exp'. Ветки 'auth' и 'dead' в pings, тостах и колонке
   состояния оставлены: настоящие отказы ставит фон — 'auth' обработчик
   авторизации, 'dead' обрыв по трафику (7Б) и проверка при подключении
   (7В), — и страница показывает их из state.lastError по подписке; к
   pings проверка не подключена (решение 29.08, см. соседний
   комментарий). */

/* решение по отказам: если проверка активного прокси вернула
   нерабочее состояние — соединение отключается само.
   7Е (приведено к 7В): ЗАМОРОЖЕНО — сюда приходят только заглушки
   блока чекеров (startCheck, кнопки проверки, checkActive), у которых
   нет входа; настоящие отказы решает фон: 'auth' ставит обработчик
   авторизации, 'dead' — обрыв по трафику (7Б) и проверка при
   подключении (7В), переключение при обрыве делает фон по тумблеру
   failover (очередь inLine), а страница лишь показывает это по подписке
   (holdSwitch, тост lostSwitched) */
function onCheckResult(id){
  const v = pings[id];
  if(id !== activeProxyId || !st.enabled || (v !== 'dead' && v !== 'auth' && v !== 'exp')) return;

  /* Настройка «Переключаться на следующий при обрыве».
     Список берём целиком, а не найденный поиском: это фон,
     человек в нём не участвует, и строка поиска не должна
     решать, на какой прокси мы упадём при обрыве. */
  if(settings.failover){
    const list = [...proxies];
    const i = list.findIndex(x => x.id === id);
    const next = list.slice(i + 1).concat(list.slice(0, i))
      .find(x => pings[x.id] !== 'dead' && pings[x.id] !== 'auth' && pings[x.id] !== 'exp' && !isExpired(x));
    if(next){
      applyState({ ...st, activeProxyId: next.id }); showPass = false;   /* этап 4: выбор запишет фон при переключении */
      renderList();
      connect(next.id, null);
      toast(msg('lostSwitched', [next.ip]), true);
      return;
    }
  }

  /* этап 4: соединение отключается через фон, герой ждёт его ответа */
  dropConnection(v, v === 'exp' ? msg('dropExp') : v === 'auth' ? msg('dropAuth') : msg('dropDead'));
}

/* выключить по отказу: срыв показывает герой, причину объявляет тост */
async function dropConnection(kind, text){
  cancelPending();
  const res = await send({ cmd:'disable' });
  await refreshState();
  heroErr = res.ok ? kind : res.error;
  clearTimeout(heroErrT);
  heroErrT = setTimeout(() => { heroErr = null; renderHero(); }, 2800);
  renderHero(); renderList();
  toast(res.ok ? text : errText(res.error), true);
}

/* одиночная проверка: результат приходит с задержкой чекера */
function startCheck(id){
  if(!CHECKERS.row) return;   /* ЗАМОРОЖЕНО */
  if(checking.has(id)) return;
  checking.add(id);
  renderList(); renderConn();
  setTimeout(() => {
    checking.delete(id);
    const p = proxies.find(x => x.id === id);
    /* 3Б.3: в прототипе — случайный отказ в 12 % проверок через failKind,
       случайное число 24…134 и случайная задержка 600…1500. Генератора
       случайных чисел в расширении нет: отказ только по сроку, число и
       задержка — нижняя граница прототипного разброса; заглушка до probe.js
       (7В, не подключено — решение 29.08) */
    pings[id] = isExpired(p) ? 'exp' : 24;
    onCheckResult(id);
    renderList(); renderConn();
  }, 600);
}

function disarmWipe(){
  armedWipe = false; clearTimeout(wipeTimer);
  const b = $('#btnWipe'), t = $('#wipeT');
  if(b) b.classList.remove('armed');
  if(t) t.textContent = msg('wipe');
}

/* Раньше пейджер рисовал все номера подряд: при пятистах прокси
   это пятьдесят кнопок и развалившаяся вёрстка. Показываем
   первую, последнюю, текущую и по одной соседней — 1 … 4 5 6 … 50.
   Ноль в списке означает пропуск: он рисуется многоточием и не
   кликается. */
function pageNums(page, pages){
  const keep = [];
  const add = n => { if(n >= 1 && n <= pages && !keep.includes(n)) keep.push(n); };
  add(1); add(page - 1); add(page); add(page + 1); add(pages);
  keep.sort((a, b) => a - b);
  const out = [];
  keep.forEach((n, i) => {
    if(i && n - keep[i - 1] > 1) out.push(0);   /* дырка → многоточие */
    out.push(n);
  });
  return out;
}

/* ── РАЗВЁРНУТЫЙ СПИСОК ПОРЦИЯМИ (2.5.1) ──────────────────────
   Строк в разметке ровно столько, сколько человек уже долистал:
   первая порция при «Показать все», следующая — за 600 px до конца.
   Дописываем в конец, а не перерисовываем: фокус и hover в уже
   показанных строках не страдают. */
const SHOW_ALL_STEP = 40;
let showAllShown = SHOW_ALL_STEP;

function appendRows(){
  if(!showAll) return;
  const vis = visibleList();
  if(showAllShown >= vis.length) return;
  const next = Math.min(vis.length, showAllShown + SHOW_ALL_STEP);
  const html = vis.slice(showAllShown, next).map(rowHtml).join('');
  showAllShown = next;
  $('#rows')?.insertAdjacentHTML('beforeend', html);
}

window.addEventListener('scroll', () => {
  if(!showAll) return;
  if(window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 600) return;
  appendRows();
}, { passive: true });

function renderPager(total, pages){
  const pg = $('#pager');
  const q = query.trim().length > 0;
  /* при поиске строка нужна всегда, даже на одной странице:
     иначе счёт «найдено 7 из 43» негде показать */
  if(pages <= 1 && !q){ showAll = false; pg.hidden = true; pg.innerHTML = ''; return; }

  /* развёрнутый режим: страниц нет, только счёт и «Свернуть» */
  if(showAll){
    pg.hidden = false;
    pg.innerHTML = `<span class="pg-info">${msg('pgAllInfo', [String(total)])}</span>`
      + `<button class="pg-all" data-pall>${msg('pgCollapse')}</button>`;
    return;
  }

  const from = (page - 1) * PER_PAGE + 1, to = Math.min(page * PER_PAGE, total);
  const chev = d => `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  let h = `<span class="pg-info">${q ? msg('pgFound', [String(total), String(proxies.length)]) : msg('pgInfo', [String(from), String(to), String(total)])}</span>`;
  if(pages > 1){
    h += `<button class="pg" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="${msg('back')}">${chev('M9.8 3.6 5.4 8l4.4 4.4')}</button>`;
    h += pageNums(page, pages).map(n => n === 0
      ? `<span class="pg-gap" aria-hidden="true">…</span>`
      : `<button class="pg ${n === page ? 'cur' : ''}" data-page="${n}">${n}</button>`).join('');
    h += `<button class="pg" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="${msg('pgFwd')}">${chev('m6.2 3.6 4.4 4.4-4.4 4.4')}</button>`;
    h += `<button class="pg-all div" data-pall>${msg('pgShowAll', [String(total)])}</button>`;
  }
  pg.hidden = false; pg.innerHTML = h;
}

function renderList(){
  disarmWipe();
  hideTip();           /* 7Е: носитель подсказки («нет в аккаунте») перерисовывается — пузырь осиротел бы */
  geoHintFor = null;   /* карточки живут внутри строк и умрут вместе с ними */
  clearTimeout(geoHintT);
  const box = $('#rows');
  $('#cnt').textContent = proxies.length;
  if(listTab !== 'list') return;   /* в «Добавить» пейджер/футер/подсказка не всплывают */
  const has = proxies.length > 0;
  $('#listFt').hidden = !has;
  $('#listHint').hidden = !has;
  $('#lSearch').hidden = !has;
  $('#btnExport').disabled = !has;
  renderTypes();   /* 2.1: счётчики по типам — всегда по всему списку */

  if(!has){
    $('#pager').hidden = true;
    box.innerHTML = `<div class="blank"><p>${msg('blank')}</p><button class="btn-ft" id="goAdd">${msg('addProxy')}</button></div>`;
    return;
  }

  /* Футер работает со ВСЕМ списком, а не с найденным: иначе
     человек введёт поиск, нажмёт «Удалить всё» и потеряет то,
     чего не видел. Раз поведение неочевидное — пишем о нём
     прямо в подсказке, и только пока поиск активен. */
  const ftTip = query.trim() ? msg('ftAll', [String(proxies.length)]) : '';
  $('#btnDedup').dataset.tip = ftTip;
  $('#btnWipe').dataset.tip = ftTip;
  $('#btnCheckAll').dataset.tip = ftTip;
  $('#btnExport').dataset.tip = ftTip ? msg('exportTip') + ' ' + ftTip : msg('exportTip');

  const vis = visibleList();
  const pages = Math.max(1, Math.ceil(vis.length / PER_PAGE));
  if(page > pages) page = pages;

  if(!vis.length){
    /* 2.1: пусто из-за фильтра — сбрасываем фильтр, а не поиск */
    const filtered = typeFilter !== 'all';
    box.innerHTML = `<div class="blank"><p>${msg('notFound')}</p><button class="btn-ft" id="clrSearch">${msg(filtered && !query.trim() ? 'lTypeReset' : 'searchReset')}</button></div>`;
    renderPager(0, 1);
    return;
  }

  const af = document.activeElement;
  const keepFocus = editId !== null && af?.classList?.contains('ed-inp') ? af.id : null;
  const keepSel = keepFocus ? [af.selectionStart, af.selectionEnd] : null;

  /* 2.5.1: развёрнутый список рисуется порциями (SHOW_ALL_STEP), остальное
     добавляется по мере прокрутки: 200 строк в разметке — это секунда на
     пересборку и прокрутка в 12 кадров вместо 60 */
  if(!showAll) showAllShown = SHOW_ALL_STEP;
  else if(showAllShown < SHOW_ALL_STEP) showAllShown = SHOW_ALL_STEP;
  const slice = showAll ? vis.slice(0, showAllShown) : vis.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  box.innerHTML = slice.map(rowHtml).join('');
  renderPager(vis.length, pages);
  if(addingTagFor !== null) $('#tagInp')?.focus();
  if(keepFocus){
    const f = $('#' + keepFocus);
    if(f){ f.focus(); try{ f.setSelectionRange(keepSel[0], keepSel[1]); }catch(err){} }
  }
}

/* ── логика ─────────────────────────────────────────────── */
/* срыв включения: герой коротко горит красным, причину объявляет тост */
function showFail(kind, text){
  heroErr = kind;
  clearTimeout(heroErrT);
  heroErrT = setTimeout(() => { heroErr = null; renderHero(); }, 2800);
  renderHero(); renderList();
  toast(text || errText(kind), true);
}

/* Этап 4: включение — сообщение фону, а не таймер. id — кого включаем:
   результат засчитывается только этому прокси и этому поколению; новый
   выбор, удаление активной строки, «Удалить всё» и выключение поднимают
   connGen, и устаревший ответ не трогает ни герой, ни список, ни тост.
   Пока фон отвечает, герой в «Подключение». 7В: проверка при подключении
   (probe.js) идёт в фоне уже ПОСЛЕ ответа окну и его не задерживает
   (DECISIONS 11.09, п. 3): «подключено» — при применении настройки,
   неверный пароль или отказ соединения с прокси приходят секунду-две
   спустя как state.lastError по подписке — герой краснеет и тост, как при
   ошибке на настоящем трафике. */
async function connect(id, doneMsg){
  const p0 = proxies.find(x => x.id === id);
  if(!p0){ renderHero(); return; }

  /* истёкший прокси не включается никогда; с проверкой включение
     может сорваться и по сети — без неё подключаемся вслепую */
  /* 3Б.3: в прототипе к сроку было добавлено условие с генератором
     случайных чисел — при включённой проверке отказ в 10 % включений
     через failKind(). В расширении отказ только по сроку (решение
     01.09); ветки auth/dead заполняет настоящий обработчик: 'auth' —
     state.lastError уже с этапа 4, 'dead' — этап 7. Обрыв по сети —
     событие onErrorOccurred, а не жребий при включении. */
  if(isExpired(p0)){
    /* соединение было включено (или включалось) на другом прокси —
       выключаем: строка уже выбрана, и гнать трафик через прежний,
       молча, нельзя. Выключение безвредно, если включиться не успели */
    const wasOn = st.enabled || busy;
    cancelPending();
    if(wasOn){
      const res = await send({ cmd:'disable' });
      if(!res.ok){ await refreshState(); showFail(res.error); return; }
    }
    await state.patchState({ activeProxyId: id }).catch(storageFail);
    await refreshState();
    pings[id] = 'exp';
    showFail('exp');
    return;
  }

  busy = true; heroErr = null;
  const gen = ++connGen;
  const verify = settings.verify;   /* настройка «Проверять при подключении» */
  if(verify) checking.add(id);
  renderHero(); renderList();
  const res = await send({ cmd: st.enabled ? 'switch' : 'enable', id });
  checking.delete(id);
  if(gen !== connGen) return;   /* попытка устарела: началось новое переключение или удаление */
  busy = false;
  await refreshState();
  if(gen !== connGen) return;
  if(!res.ok){ showFail(res.error); return; }

  /* проверка при подключении даёт только «Работает»: она
     мерит маленький файл, и уровень по ней не считается */
  /* 3Б.3: число — нижняя граница случайного разброса прототипа
     (28…98), заглушка до probe.js (7В, не подключено — решение 29.08:
     настоящий результат пишет фон в state.lastProbeAt/lastProbeMs, его и
     печатает диагностика; pings нигде не показывается) */
  if(verify){ pings[id] = 28; }
  renderHero(); renderList();
  if(doneMsg && res.reloaded === true) doneMsg += msg('tabReloaded');   /* 7Б: хвост только когда фон вкладку действительно перезагрузил (тумблер, обычная http/https-вкладка) */
  if(doneMsg){ if(probing()) pendMsg = doneMsg; else toast(doneMsg); }   /* 7В: пока идёт проверка — тост ждёт её конца */
}

/* ── 2.4: кнопка строки «Connected / Disconnected» ──────────────────
   Зелёная — эта строка подключена (она активна и прокси включён): клик
   отключает. Красная — подключает именно её: выбор записывается сразу,
   чтобы герой и строка не показывали разное, дальше идёт обычный
   connect(). Пока идёт переключение (busy/reconn), второй клик ничего не
   делает — иначе два ответа фона подряд перепутали бы состояние. */
async function rowConn(id){
  const p = proxies.find(x => x.id === id);
  if(!p || busy || reconn) return;
  closeMenus();
  if(id === activeProxyId && st.enabled){
    heroErr = null; connGen++; clearTimeout(heroErrT);
    const res = await send({ cmd:'disable' });
    await refreshState();
    renderHero(); renderList();
    toast(res.ok ? msg('direct') : errText('noAnswer'), !res.ok);
    return;
  }
  if(id !== activeProxyId){
    /* только локально: запись activeProxyId — дело фона. Если написать её
       здесь, получится гонка двух контекстов (у страницы и у воркера свои
       очереди записи): фон успевает поставить enabled: true, а страница
       поверх кладёт свой снимок с enabled: false — и прокси «включается»,
       оставаясь выключенным. Ровно поэтому select() тоже не пишет выбор,
       когда включение делает фон. */
    applyState({ ...st, activeProxyId: id });
    showPass = false; heroErr = null;
    renderList(); renderHero();
  }
  if(isExpired(p)){
    /* срок вышел — connect сам откажет и покажет причину */
    connect(id, null);
    return;
  }
  connect(id, msg('connectedVia', [p.ip]));
}

/* ── 2.4: «Определить страну» из меню строки ──
   Спрашиваем фон (geoOne) и ждём ответа: список перерисует подписка на
   хранилище, отдельной перерисовки не нужно. Ответ без страны — тост с
   причиной: адрес мог оказаться частным (192.168…), сервисы могли
   молчать. */
async function geoOne(id){
  closeMenus();
  const p = proxies.find(x => x.id === id);
  if(!p) return;
  toast(msg('geoLooking'));
  let res = null;
  try { res = await send({ cmd:'geoOne', id }); } catch(err){ res = null; }
  if(res && res.ok && res.cc){
    toast(msg('geoFound', [geoPlace({ ...p, cc: res.cc, city: res.city })]));
  } else {
    toast(msg('geoNone'), true);
  }
}

/* 7В: проверка при подключении закончилась (state.probing снят при
   включённом прокси). Ошибку уже объявил noteLastError — отложенный тост
   не нужен; результат без кода («не прошла» при живом прокси) на экран не
   выходит — только диагностика (решение человека 11.09, В4-а) */
function probeDone(){
  if(!st.enabled) return;
  if(st.lastError){ pendMsg = null; return; }
  if(pendMsg && !reconn){ toast(pendMsg); pendMsg = null; }
}

/* 7В (В2-а): картинка расстыковки для переключения, которое сделал фон при
   обрыве, — без команды фону: новый прокси уже записан, после выдоха герой
   стыкуется к нему по состоянию; тост — по концу выдоха (или проверки) */
function holdSwitch(doneMsg){
  clearTimeout(reconnT);
  reconn = true; heroErr = null; pendMsg = doneMsg;
  renderHero(); renderList();
  reconnT = setTimeout(() => {
    reconn = false;
    renderHero(); renderList();
    if(pendMsg && st.enabled && !probing()){ toast(pendMsg); pendMsg = null; }
  }, 620);
}

/* физика смены прокси: коннектор выходит из порта (.55s по CSS),
   короткий выдох — и обычное согласование заново. Кого подключать после
   расстыковки, решается в конце выдоха: новый выбор за это время
   перезапускает расстыковку и меняет адресата (аудит 3Б.4, проход Б) */
function reconnect(doneMsg){   /* 3Б.6: параметр назывался как импорт msg из i18n.js и затенял его; имя как у connect(doneMsg) в попапе */
  clearTimeout(reconnT); connGen++;
  busy = false; reconn = true; heroErr = null;
  renderHero(); renderList();
  reconnT = setTimeout(() => { reconn = false; connect(activeProxyId, doneMsg); }, 620);
}

/* быстрая правка активного прокси прямо из героя: открывает
   инлайн-редактор его строки в списке и подводит к ней */
$('#btnHeroEdit').addEventListener('click', () => {
  const p = active(); if(!p) return;
  openEdit(p.id, false);
  requestAnimationFrame(() => $('.row.edit')?.scrollIntoView({ block:'nearest', behavior:'smooth' }));
});

/* тема: по умолчанию всегда тёмная, светлая — по кнопке в шапке
   3Б.3: атрибут темы на <html> (решение 07.09), в прототипе был на body;
   класс .theming, гасящий переходы, остаётся на body. До первой отрисовки
   тему ставит theme.js (пока только 'dark', см. этап 4) */
const THM_SUN = iconSun(19), THM_MOON = iconMoon(19);   /* 3Б.6: из icons.js, размер как в прототипе; в попапе те же значки 20×20 */
/* этап 4: кнопка только пишет settings.theme; страницу перекрашивает
   applyTheme() по подписке — тем же путём, что и при смене темы в попапе:
   открытая страница меняет тему вслед за попапом, и наоборот */
$('#btnTheme').addEventListener('click', () => {
  const toLight = document.documentElement.dataset.theme !== 'light';
  /* не writeSetting: она меняет копию сразу, и эхо из хранилища совпало бы
     с копией — подписка сочла бы, что менять нечего, и страница осталась бы
     в прежней теме (так и вышло на первой проверке 08.09) */
  state.patchSettings({ theme: toLight ? 'light' : 'dark' }).catch(storageFail);
});
function applyTheme(theme){
  const light = theme === 'light';
  document.body.classList.add('theming');   /* заморозка переходов на смену */
  if(light) document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
  const b = $('#btnTheme');
  b.innerHTML = light ? THM_MOON : THM_SUN;
  b.title = light ? msg('themeToDark') : msg('themeToLight');
  b.setAttribute('aria-pressed', String(light));
  renderList();   /* палитра заметок следует за темой */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('theming')));
}

/* ── смена языка: глобус в шапке, выбор перерисовывает всё ──
   3Б.3: блока нет — решение 07.09, как в попапе. Язык расширения задаёт
   браузер: chrome.i18n переключать на лету нечем, и отдельной кнопки по
   плану нет. В прототипе здесь стояли setLang() и два обработчика
   (#btnLang, #langMenu); снимать их там же. */


/* срок активного истекает — чип в герое ведёт к продлению (7Е: в кабинет,
   goRenew, не в корзину) */
$('#stChips').addEventListener('click', e => {
  if(e.target.closest('#heroExp')){ goRenew(); return; }
  const g = e.target.closest('[data-geohero]');
  if(g) openGeoPickAt(g.dataset.geohero);   /* этап 4: id — строка */
});

/* метка списка ведёт в свой раздел настроек */
$('#stMode').addEventListener('click', () => {
  goView('settings'); setSettingsTab('lists');
});

$('#btnPower').addEventListener('click', async () => {
  if(busy || reconn) return;
  if(st.enabled){
    /* этап 4: выключение — сообщение фону; выбор при этом сохраняется */
    heroErr = null; connGen++; clearTimeout(heroErrT);
    const res = await send({ cmd:'disable' });
    await refreshState();
    renderHero(); renderList();
    if(!res.ok){ toast(errText('noAnswer'), true); return; }
    toast(msg('direct'));
  } else {
    const p = active(); if(!p) return;
    connect(p.id, msg('connectedVia', [p.ip]));
  }
});

/* фазы кнопки проверки: результат она показывает сама,
   без тостов; длительности синхронизированы с CSS через --sweep */
const CHECK_MS = 900, RESULT_MS = 1900;
const icoPulse = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.6 8.2h2.5L6 3.4l4 9.2 1.9-4.4h2.5"/></svg>';
const icoOk    = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m2.9 8.7 3.3 3.3 6.9-7.4"/></svg>';
const icoFail  = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6"/></svg>';

$('#btnCheck').addEventListener('click', function(){
  const p = active(); if(!p || this.dataset.phase || !CHECKERS.hero) return;   /* ЗАМОРОЖЕНО */

  this.dataset.phase = 'checking';
  this.style.setProperty('--sweep', CHECK_MS + 'ms');
  $('#checkT').textContent = msg('chkBusy');
  checking.add(p.id);
  renderList(); renderConn();

  setTimeout(() => {
    checking.delete(p.id);
    /* 3Б.3: в прототипе случайный отказ в 12 % через failKind и случайное
       число 24…134; здесь отказ только по сроку, число — нижняя граница
       разброса, заглушка до probe.js (7В, не подключено — решение 29.08).
       Блок заморожен за CHECKERS.hero */
    const fail = isExpired(p);
    pings[p.id] = fail ? 'exp' : 24;
    onCheckResult(p.id);
    renderConn(); renderList();

    this.dataset.phase = fail ? 'fail'
      : pings[p.id] < 70 ? 'ok' : pings[p.id] < 140 ? 'mid' : 'slow';
    this.style.setProperty('--sweep', RESULT_MS + 'ms');
    $('#checkIco').innerHTML = fail ? icoFail : icoOk;
    $('#checkT').textContent = fail
      ? (pings[p.id] === 'auth' ? msg('chkAuth') : msg('chkDead'))
      : msg('chkMs', [String(pings[p.id])]);

    setTimeout(() => {
      delete this.dataset.phase;
      $('#checkIco').innerHTML = icoPulse;
      $('#checkT').innerHTML = `<span class="chk-lg">${msg('chkLg')}</span><span class="chk-sm">${msg('chkSm')}</span>`;
    }, RESULT_MS);
  }, CHECK_MS);
});

$('#btnEye').addEventListener('click', () => { showPass = !showPass; renderHero(); });
$('#vLogin').addEventListener('click', function(){ copyVal(this, active()?.login); });
$('#vPass').addEventListener('click',  function(){ copyVal(this, active()?.pass);  });

/* выбор строки + меню */
function select(id){
  if(id === activeProxyId) return;
  /* сразу, до записи: строка не ждёт хранилища */
  applyState({ ...st, activeProxyId: id }); showPass = false; heroErr = null;
  closeMenus(); renderList();
  const p = active();
  /* этап 4: включён, включается или расстыковывается — переключаем через
     фон после выдоха; во время расстыковки это «подключено», а не «просто
     выбран» (аудит 3Б.4). Выключен — просто записываем выбор: пока прокси
     включён, activeProxyId пишет только фон */
  if(st.enabled || busy || reconn){
    /* хвост « · вкладка перезагружена» (снятый 09.09) с 7Б приписывает
       connect() по ответу фона reloaded: true — не по настройке, как в
       прототипе: вкладку перезагружает фон, и только обычную страницу */
    reconnect(msg('switchedTo', [p.ip]));
  } else {
    renderHero();
    state.patchState({ activeProxyId: id }).catch(storageFail);
    toast(msg('selected', [p.ip]));
  }
}

function closeMenus(){
  $$('.menu').forEach(m => m.hidden = true);
  $$('[data-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
  $$('[data-nsdd]').forEach(b => b.setAttribute('aria-expanded', 'false'));   /* 7З: список прокси строки «Уведомления о сроках» — то же меню */
  /* 3Б.3: строки про #btnLang нет — глобуса нет */
}

function commitTag(id, raw){
  const p = proxies.find(x => x.id === id);
  addingTagFor = null;
  const v = (raw || '').trim().replace(/^#+/, '').slice(0, TAG_LEN);
  if(!p || !v){ renderList(); return; }
  if(p.tags.some(t => t.toLowerCase() === v.toLowerCase())){ renderList(); toast(msg('tagDup')); return; }
  if(p.tags.length >= TAG_MAX){ renderList(); toast(msg('tagMax', [String(TAG_MAX)])); return; }
  p.tags.push(v); persist(); renderList();
}

/* правка существующей заметки: пустой текст — откат без изменений */
function commitTagEdit(raw){
  const at = editTagAt; editTagAt = null;
  const p = at && proxies.find(x => x.id === at.id);
  const v = (raw || '').trim().replace(/^#+/, '').slice(0, TAG_LEN);
  if(!p || !v){ renderList(); return; }
  if(p.tags.some((x, i) => i !== at.i && x.toLowerCase() === v.toLowerCase())){ renderList(); toast(msg('tagDup')); return; }
  p.tags[at.i] = v; persist(); renderList();
}

$('#rows').addEventListener('click', e => {
  if(e.target.closest('#goAdd')){ setListTab('add'); return; }
  if(e.target.closest('#clrSearch')){
    /* 2.1: пусто из-за фильтра — снимаем фильтр; иначе чистим поиск */
    if(typeFilter !== 'all' && !query.trim()){ typeFilter = 'all'; renderList(); }
    else clearSearch(true);
    return;
  }
  if(e.target.closest('.ed-inp')) return;

  /* ── 2.4: подключить / отключить прямо в строке ── */
  const cn = e.target.closest('[data-conn]');
  if(cn){ rowConn(cn.dataset.conn); return; }

  /* ── выбор страны ── */
  const gp = e.target.closest('[data-geopick]');
  if(gp){
    const id = gp.dataset.geopick;   /* этап 4: id — строка */
    const same = geoPickFor === id;
    hideGeoHint(true);            /* карточка своё дело сделала */
    closeGeoPick();
    if(!same){ geoPickFor = id; addingTagFor = null; editTagAt = null; }
    renderList();
    $('#gpQ')?.focus();
    return;
  }
  /* клик по самой метке: список открывает кнопка в карточке, а
     метка только показывает карточку — но на тачскрине ховера
     нет, и там клик должен работать напрямую */
  const gt = e.target.closest('[data-geotip]');
  if(gt){
    const p = proxies.find(x => x.id === gt.dataset.geotip);
    if(p && canPickGeo(p) && geoHintFor === null){
      hideGeoHint(true);
      geoPickFor = p.id; geoQuery = '';
      addingTagFor = null; editTagAt = null;
      renderList();
      $('#gpQ')?.focus();
    } else if(p && canPickGeo(p)){
      showGeoHint(gt);
    }
    return;
  }
  const gs = e.target.closest('[data-gset]');
  if(gs){ setGeo(gs.dataset.gset); return; }
  if(e.target.closest('[data-gclear]')){
    const p = proxies.find(x => x.id === geoPickFor);
    if(p){ delete p.cc; delete p.city; delete p.ccAuto; persist(); }   /* этап 4: без отдельного признака ручной отметки; 2.4: город и метка авто — вместе со страной */
    closeGeoPick();
    renderList(); renderHero();
    toast(msg('geoCleared'));
    return;
  }
  if(e.target.closest('.geo-pick')) return;   /* клики внутри списка строку не переключают */

  /* пустой слот страны и «нет в аккаунте» — только подсказки:
     строку не выбираем, фокус держит тултип открытым на тачскрине */
  if(e.target.closest('.geo-q') || e.target.closest('.nacc')) return;
  if(e.target.closest('[data-edsave]')){ saveEdit(); return; }
  if(e.target.closest('[data-edcancel]')){ cancelEdit(); return; }
  const tp = e.target.closest('[data-edtype]');
  if(tp && tp.getAttribute('aria-disabled') === 'true') return;
  if(tp && editDraft){
    editDraft.type = tp.dataset.edtype;
    $$('#segEd button').forEach(b => b.setAttribute('aria-pressed', b.dataset.edtype === editDraft.type));
    return;
  }
  const untag = e.target.closest('[data-untag]');
  if(untag){
    const [pid, idx] = untag.dataset.untag.split('|');   /* этап 4: pid — строка, idx — число */
    const p = proxies.find(x => x.id === pid);
    if(p){ p.tags.splice(+idx, 1); persist(); renderList(); }
    return;
  }
  const addt = e.target.closest('[data-addtag]');
  if(addt){
    addingTagFor = addt.dataset.addtag;
    renderList(); $('#tagInp')?.focus();
    return;
  }
  const te = e.target.closest('[data-tagedit]');
  if(te){
    const [pid, idx] = te.dataset.tagedit.split('|');
    addingTagFor = null; editTagAt = { id:pid, i:+idx };
    renderList();
    const inp = $('#tagInp'); if(inp){ inp.focus(); inp.select(); }
    return;
  }
  if(e.target.closest('.tag-inp')) return;
  const chk = e.target.closest('[data-check]');
  if(chk){ startCheck(chk.dataset.check); return; }
  const menuBtn = e.target.closest('[data-menu]');
  if(menuBtn){
    const menu = menuBtn.nextElementSibling, wasOpen = !menu.hidden;
    closeMenus();
    if(!wasOpen){ menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
    return;
  }
  const cp = e.target.closest('[data-copy]');
  if(cp){
    const p = proxies.find(x => x.id === cp.dataset.copy);
    closeMenus();
    if(p){
      /* строка для буфера обмена, не разметка: без esc(). Этап 4: адрес с
         портом собирает hostPort() из parse.js — IPv6 уходит в скобках,
         иначе строка не разобралась бы обратно */
      const s = p.login ? `${hostPort(p)}@${p.login}:${p.pass}` : hostPort(p);
      copyText(s, msg('proxyCopied'));   /* 3Б.6: тот же блок буфера стоял здесь копией copyText */
    }
    return;
  }
  const fix = e.target.closest('[data-fix]');
  if(fix){ openEdit(fix.dataset.fix, true); return; }
  const rn = e.target.closest('[data-renew]');
  if(rn){ closeMenus(); goRenew(); return; }   /* 7Е: кабинет (urlMy), не корзина */
  const edit = e.target.closest('[data-edit]');
  if(edit){
    openEdit(edit.dataset.edit);
    return;
  }
  /* 2.1: проверка протокола строки — до правки: результат меняет тип
     записи, и открытая форма правки показала бы старое значение */
  const tcheck = e.target.closest('[data-tcheck]');
  if(tcheck){ checkTypeOf(tcheck.dataset.tcheck); return; }
  const g1 = e.target.closest('[data-geoone]');
  if(g1){ geoOne(g1.dataset.geoone); return; }
  const del = e.target.closest('[data-del]');
  if(del){
    const id = del.dataset.del;
    const wasActive = id === activeProxyId;
    const rest = proxies.filter(p => p.id !== id);
    delete pings[id];
    /* 3Б.5: удаляемый прокси мог быть в подключении (busy) или в
       расстыковке (reconn) — устаревший таймер или ответ фона не должен
       подключить соседа с тостом про того, кого уже нет. Этап 4: это
       делает commitList — поднимает поколение, снимает расстыковку и,
       если прокси был включён, переключает через фон на соседа (или
       выключает, когда соседа нет) ДО записи списка. Сосед при
       включённом прокси подключается сам, как в прототипе */
    const nextActive = wasActive ? (rest[0]?.id ?? '') : activeProxyId;
    closeMenus();
    commitList(rest, nextActive).then(() => {
      renderList(); renderHero();
      if(!proxies.length) setListTab('add');
      toast(wasActive && nextActive ? msg('deletedSwitched', [active().ip]) : msg('deleted'));
    }).catch(storageFail);
    return;
  }
  if(e.target.closest('.mwrap')) return;
  const row = e.target.closest('.row');
  if(row && !row.classList.contains('edit')) select(row.dataset.id);   /* этап 4: id — строка */
});

/* ── карточка страны: наведение и фокус ──
   Держим её открытой, пока указатель на метке или на самой
   карточке: между ними есть зазор, и без задержки на закрытие
   до кнопки внутри не дотянуться. */
$('#rows').addEventListener('mouseover', e => {
  const m = e.target.closest('[data-geotip]');
  if(m){ clearTimeout(geoHintT); showGeoHint(m); return; }
  if(e.target.closest('.geo-hint')){ clearTimeout(geoHintT); return; }
  if(geoHintFor !== null) hideGeoHint();
});
$('#rows').addEventListener('mouseleave', () => hideGeoHint());
$('#rows').addEventListener('focusin', e => {
  const m = e.target.closest('[data-geotip]');
  if(m){ clearTimeout(geoHintT); showGeoHint(m); }
});
$('#rows').addEventListener('focusout', e => {
  if(e.target.closest('[data-geotip]') || e.target.closest('.geo-hint')) hideGeoHint();
});
/* строка уехала под прокрутку — карточка осталась бы висеть */
window.addEventListener('scroll', () => { if(geoHintFor !== null) hideGeoHint(true); }, true);

$('#rows').addEventListener('keydown', e => {
  if(e.target.id === 'gpQ'){
    if(e.key === 'Escape'){ e.stopPropagation(); closeGeoPick(); renderList(); }
    else if(e.key === 'Enter'){
      /* Enter берёт первую строку списка: набрал «нид» — нажал */
      e.preventDefault();
      const first = e.target.closest('.geo-pick').querySelector('[data-gset]');
      if(first) setGeo(first.dataset.gset);
    }
    return;
  }
  if(e.target.classList?.contains('ed-inp')){
    if(e.key === 'Enter'){ e.preventDefault(); saveEdit(); }
    else if(e.key === 'Escape'){ e.stopPropagation(); cancelEdit(); }
    return;
  }
  if(e.target.classList?.contains('tag-inp')){
    if(e.key === 'Enter'){ e.preventDefault(); editTagAt ? commitTagEdit(e.target.value) : commitTag(addingTagFor, e.target.value); }
    else if(e.key === 'Escape'){ addingTagFor = null; editTagAt = null; renderList(); }
    return;
  }
  const addt = e.target.closest('[data-addtag]');
  if(addt && (e.key === 'Enter' || e.key === ' ')){
    e.preventDefault();
    addingTagFor = addt.dataset.addtag;
    renderList(); $('#tagInp')?.focus();
    return;
  }
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('.row');
  if(row && e.target === row){ e.preventDefault(); select(row.dataset.id); }
});

/* клик мимо открытого инпута заметки: есть текст — сохраняем,
   пусто — закрываем (правка пустым текстом откатывается) */
$('#rows').addEventListener('focusout', e => {
  if(!e.target.classList?.contains('tag-inp')) return;
  const val = e.target.value;
  setTimeout(() => {
    if(document.activeElement?.id === 'tagInp') return;
    if(editTagAt){ commitTagEdit(val); }
    else if(addingTagFor !== null){ commitTag(addingTagFor, val); }
  }, 120);
});

/* табы панели: список ↔ добавление */
function setSettingsTab(t){
  $$('#stabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.stab === t));
  $('#sp-base').hidden = t !== 'base';
  $('#sp-keys').hidden = t !== 'keys';
  $('#sp-lists').hidden = t !== 'lists';
  if(t === 'keys') readShortcuts().then(renderKeys);   /* 7Д: сочетания — у браузера, при каждом открытии вкладки */
}
$('#stabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-stab]'); if(b) setSettingsTab(b.dataset.stab);
});

function setListTab(t){
  listTab = t;
  editId = null; editDraft = null; editTagAt = null; addingTagFor = null;
  closeGeoPick();
  $$('#ltabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.ltab === t));
  const isList = t === 'list';
  $('#paneAdd').hidden = isList;
  $('#rows').hidden = !isList;
  $('#listHint').hidden = !isList;
  $('#lSearch').hidden = !isList || !proxies.length;
  if(isList){
    renderList();
  } else {
    $('#pager').hidden = true;
    $('#listFt').hidden = true;
  }
}
$('#ltabs').addEventListener('click', e => {
  const b = e.target.closest('[data-ltab]');
  if(b) setListTab(b.dataset.ltab);
});

/* ── поиск по списку ── */
function clearSearch(focus){
  query = ''; $('#lq').value = ''; $('#lqX').hidden = true;
  page = 1; renderList();
  if(focus) $('#lq').focus();
}
let searchFrame = 0;
$('#lq').addEventListener('input', e => {
  query = e.target.value;
  /* новый запрос — новый список: держать человека на седьмой
     странице прежней выборки бессмысленно */
  page = 1; showAll = false;
  closeGeoPick();
  $('#lqX').hidden = !query;
  /* 2.5.1: ввод приходит чаще кадра (автоповтор, вставка, быстрая
     печать), а пересборка строк — работа на кадр целиком. Собираем
     буквы в кадр: список перерисуется один раз, курсор не дрожит */
  if(searchFrame) return;
  searchFrame = requestAnimationFrame(() => { searchFrame = 0; renderList(); });
});
$('#lq').addEventListener('keydown', e => {
  if(e.key === 'Escape'){ e.stopPropagation(); clearSearch(true); }
});
$('#lqX').addEventListener('click', () => clearSearch(true));

/* пагинация */
$('#pager').addEventListener('click', e => {
  if(e.target.closest('[data-pall]')){
    showAll = !showAll;
    if(!showAll){
      /* сворачиваемся на страницу с активным прокси */
      const i = visibleList().findIndex(p => p.id === activeProxyId);
      page = i > -1 ? Math.floor(i / PER_PAGE) + 1 : 1;
    }
    renderList();
    return;
  }
  const b = e.target.closest('[data-page]');
  if(!b || b.disabled) return;
  page = +b.dataset.page; renderList();
});

/* дубликаты определяем по паре ip:port. Этап 4: из группы остаётся
   запись с заполненными логином и паролем (промт п. 8), а не первая
   попавшаяся; ни одной такой — первая. Со ВСЕМ списком, не с найденным */
$('#btnDedup').addEventListener('click', () => {
  const before = proxies.length;
  const ak = active() ? active().ip + ':' + active().port : null;
  const groups = new Map();
  proxies.forEach(p => {
    const k = p.ip + ':' + p.port;
    if(!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  });
  const keep = new Set();
  groups.forEach(g => keep.add(g.find(p => p.login && p.pass) || g[0]));
  const list = proxies.filter(p => keep.has(p));
  const n = before - list.length;
  if(!n){ toast(msg('dedupNone')); return; }
  proxies.forEach(p => { if(!keep.has(p)) delete pings[p.id]; });
  let nextActive = activeProxyId;
  if(!list.some(p => p.id === activeProxyId)){
    nextActive = list.find(p => p.ip + ':' + p.port === ak)?.id ?? list[0]?.id ?? '';
  }
  commitList(list, nextActive).then(() => {
    renderHero(); renderList();
    toast(msg('dedupN', [String(n)]));
  }).catch(storageFail);
});

/* ── ЭКСПОРТ СПИСКА ─────────────────────────────────────────
   Строка на прокси, поля через двоеточие: ip:port:логин:пароль.
   Формат выбран не нами — так показывает адреса личный кабинет
   proxys.io, и ровно его понимает вкладка «Строкой». Значит
   файл возвращается и к нам, и в любую другую программу.

   Заметки дописываются в конец после решётки. Для чужих
   программ это комментарий, который они не увидят; наш разбор
   их подберёт обратно (см. parse.js).

   Страна и срок в файл не идут намеренно: они принадлежат
   аккаунту, а не адресу. Выгруженный вчера срок сегодня уже
   врёт, и лучше пустое поле, чем устаревшее. */
function exportProxies(){
  if(!proxies.length) return;
  const lines = proxies.map(p => {
    let s = hostPort(p);   /* этап 4: IPv6 — в скобках, иначе не разобрать обратно */
    if(p.login) s += ':' + p.login + (p.pass ? ':' + p.pass : '');
    if(p.tags && p.tags.length) s += ' ' + p.tags.map(t => '#' + t).join(' ');
    return s;
  });
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n') + '\n'], { type:'text/plain' }));
  a.download = `proxys-io-proxies-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.txt`;
  a.click(); URL.revokeObjectURL(a.href);
  toast(msgN('exportedN', proxies.length));
}
$('#btnExport').addEventListener('click', exportProxies);

/* «Удалить всё» — двухшаговое подтверждение прямо в кнопке */
$('#btnWipe').addEventListener('click', function(){
  if(!armedWipe){
    armedWipe = true; this.classList.add('armed');
    $('#wipeT').textContent = msg('wipeAsk', [String(proxies.length)]);
    clearTimeout(wipeTimer);
    wipeTimer = setTimeout(() => {
      armedWipe = false; this.classList.remove('armed');
      $('#wipeT').textContent = msg('wipe');
    }, 3200);
    return;
  }
  clearTimeout(wipeTimer); armedWipe = false;
  /* 3Б.5: поколение и таймер расстыковки — иначе устаревший таймер
     connect/reconnect поставил бы «включено» на пустом списке.
     Этап 4: это делает commitList; включённый прокси она выключает через
     фон до записи пустого списка. Со ВСЕМ списком, не с найденным */
  page = 1; addingTagFor = null;
  commitList([], '').then(() => {
    renderList(); renderHero();
    setListTab('add');
    toast(msg('wiped'));
  }).catch(storageFail);
});

/* массовая проверка: чекер опрашивает каждый прокси, ответы
   приходят вразнобой — строки и пинг оживают по мере поступления */
let massBusy = false;
$('#btnCheckAll').addEventListener('click', function(){
  if(!CHECKERS.all) return;   /* ЗАМОРОЖЕНО */
  if(massBusy || !proxies.length) return;
  massBusy = true; this.disabled = true;
  const ids = proxies.map(p => p.id), total = ids.length;
  let done = 0;
  ids.forEach(id => checking.add(id));
  $('#chkAllT').textContent = msg('chkAllRun', ['0', String(total)]);
  renderList(); renderConn();

  ids.forEach((id, i) => setTimeout(() => {
    checking.delete(id);
    const p = proxies.find(x => x.id === id);
    if(p){
      /* 3Б.3: в прототипе случайный отказ в 15 % через failKind и случайное
         число 24…144; здесь только срок и нижняя граница разброса,
         заглушка до probe.js (7В, не подключено — решение 29.08). Блок
         заморожен за CHECKERS.all */
      pings[id] = isExpired(p) ? 'exp' : 24;
      onCheckResult(id);
    }
    done++;
    $('#chkAllT').textContent = done < total ? msg('chkAllRun', [String(done), String(total)]) : msg('chkAll');
    renderList(); renderConn();
    if(done === total){
      massBusy = false; this.disabled = false;
      const bad = ids.filter(x => pings[x] === 'dead' || pings[x] === 'auth').length;
      toast(bad ? msg('doneBad', [String(bad), String(total)]) : msg('doneAll'));
    }
  }, 500 + i * 260));   /* 3Б.3: без случайной добавки к задержке */
});

/* Гадание страны по IP убрано вместе с показом страны у ручных
   прокси: определял её клиент, а выглядела она как факт от
   сервиса. Теперь страна приходит только с прокси из proxys.io. */

/* режимы добавления: строкой · полями · по ключу */
$('#segMode').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  $$('#segMode button').forEach(x => x.setAttribute('aria-pressed', x === b));
  ['paste','fields','key'].forEach(m => $('#am-' + m).hidden = (m !== b.dataset.amode));
});

/* общий финал добавления: в список, на страницу с новичками.
   Этап 4: запись собирается в форме схемы PROXY — id строкой от
   newProxyId(), порт числом, заметки массивом; полей cc и exp у ручного
   прокси нет вовсе. skipped — сколько строк вставки не разобралось */
async function addProxies(list, skipped = 0){
  if(!list.length) return;
  const fresh = list.map(p => ({ id: state.newProxyId(), ...p, port: parseInt(p.port, 10), tags: Array.isArray(p.tags) ? p.tags : [] }));
  const next = [...proxies, ...fresh];
  /* нечего было выбрать — выбираем последнего добавленного; пока прокси
     включён, выбор пишет только фон */
  const nextActive = (active() || st.enabled) ? activeProxyId : next[next.length - 1].id;
  try{ await commitList(next, nextActive); }
  catch(err){ storageFail(err); return; }
  setListTab('list');
  if(!showAll) page = Math.ceil(proxies.length / PER_PAGE);
  renderList(); renderHero();
  toast(skipped ? msg('addedSkipped', [String(list.length), String(skipped)])
      : list.length === 1 ? msg('proxyAdded') : msg('proxiesAdded', [String(list.length)]));
}

/* разбор строки: ip:port · ip:port@логин:пароль · ip:port:логин:пароль ·
   ip:port:логин · логин:пароль@ip:port · ссылки, имена хостов, IPv6 в
   скобках; хвост с заметками после « #» — так пишет наш экспорт.
   Этап 4: parseProxy отсюда переехала в src/shared/parse.js (её же зовёт
   быстрое добавление попапа) и дописана по форматам промта; здесь
   осталась parseProxyLines — разбор всей вставки с подсчётом строк,
   которые не поняты. Разделители — перевод строки, точка с запятой,
   табуляция */

/* 2.1: выбранный протокол формы «Полями». По умолчанию HTTP — как было.
   Сбрасывается только перезагрузкой страницы: человек заполняет несколько
   строк одним типом и не должен выбирать его заново. */
let addType = 'HTTP';

/* ── 2.1 · РАЗБОР ВСТАВКИ И ПРОВЕРКА ТИПА ───────────────────────────
   Живой разбор, кнопка «Добавить» и проверка типа читают поле одной
   функцией parseBulk(): иначе проверенный тип терялся бы при следующем
   чтении строки — parseProxy каждый раз выводит его заново. */
const bulk = $('#bulk'), read = $('#read');

/* Точные типы, полученные проверкой, по адресу ip:port. Живут, пока
   открыта страница: после добавления точный тип уже в записи. */
const verifiedTypes = new Map();

function applyVerified(list){
  for(const p of list){
    const t = verifiedTypes.get(hostPort(p));
    if(t){ p.type = t; p.typeVerified = true; delete p.typeGuess; }
  }
  return list;
}

function parseBulk(text){
  const { found, skipped } = parseProxyLines(text);
  return { found: applyVerified(found), skipped };
}

/* 2.1: при вставке списка — построчно, какой адрес к какой категории
   отнесён. Сводка сверху говорит «сколько каких», этот список — «где
   какой»: человек видит догадку (со звёздочкой) у каждого адреса, а не
   только сумму, и может поправить одну строку, а не весь список.
   Строк может быть много — показываем первые BULK_LINES, остальные
   считаем словами: разбор всё равно идёт по всем. */
const BULK_LINES = 40;
function bulkLines(found){
  if(!found.length) return '';
  const rows = found.slice(0, BULK_LINES).map(p => {
    const t = normType(p.type);
    return `<li><span class="bl-a">${esc(hostPort(p))}</span>`
      + `<span class="tp" data-pt="${t}">${esc(typeLabel(p.type, p.typeGuess))}</span></li>`;
  }).join('');
  const more = found.length > BULK_LINES
    ? `<li class="bl-more">${esc(msg('andMore', [String(found.length - BULK_LINES)]))}</li>`
    : '';
  return `<ul class="bl">${rows}${more}</ul>`;
}

function renderBulkPreview(){
  const { found, skipped } = parseBulk(bulk.value);
  const total = found.length + skipped.length;
  const check = $('#btnTypeCheck');
  if(check) check.hidden = !found.length;
  if(!total){ read.className = 'read'; read.innerHTML = ''; return; }
  read.className = 'read on';
  /* 2.1: при вставке нескольких строк — сразу видно, сколько каких типов.
     Это и есть «категория по IP»: человек не открывает список, чтобы
     понять, что у него SOCKS5, а что HTTP. */
  if(total > 1){
    const c = typeCounts(found);
    read.innerHTML = found.length
      ? `<span class="rc"><s>${msg('recognized')}</s><b>${msg('ofN', [String(found.length), String(total)])}</b></span>`
        + PROXY_TYPES.filter(t => c[t]).map(t =>
            `<span class="rc type-rc" data-pt="${t}"><s>${t}</s><b>${c[t]}</b></span>`).join('')
        + bulkLines(found)
      : `<span class="no">${msg('noneMatched')}</span>`;
    return;
  }
  const p = found[0];
  read.innerHTML = p
    ? `<span class="rc"><s>${msg('phAddr')}</s><b>${esc(p.ip)}</b></span>` +
      `<span class="rc"><s>${msg('phPort')}</s><b>${esc(p.port)}</b></span>` +
      (p.login ? `<span class="rc"><s>${msg('phLogin')}</s><b>${esc(p.login)}</b></span>` : '') +
      (p.pass ? `<span class="rc"><s>${msg('phPass')}</s><b>${'•'.repeat(Math.min(p.pass.length, 12))}</b></span>` : '') +
      `<span class="rc type-rc" data-pt="${normType(p.type)}"><s>${msg('phType')}</s><b>${esc(typeLabel(p.type, p.typeGuess))}</b></span>`
    : `<span class="no">${msg('parseFail')}</span>`;
}

bulk.addEventListener('input', () => {
  bulk.classList.remove('bad');
  renderBulkPreview();
});

/* Проверка протокола для всех разобранных строк — по очереди: браузер
   может держать только одну настройку прокси. Кнопка показывает прогресс
   и на время работы гаснет.
   2.3: проверяем ТОЛЬКО догадки по порту. Строка со схемой (socks5://,
   socks4://, https://, http://) уже несёт точный тип — гонять по ней четыре
   пробы значит платить секундами за ответ, который известен из самой строки.
   Для длинного списка с явными схемами проверка теперь мгновенная. */
$('#btnTypeCheck').addEventListener('click', async () => {
  const btn = $('#btnTypeCheck');
  if(st.enabled){ toast(msg('typeNeedOff'), true); return; }
  const { found } = parseBulk(bulk.value);
  if(!found.length) return;
  const guesses = found.filter(p => p.typeGuess);
  const exact = found.length - guesses.length;
  /* проверять нечего: все типы пришли из схем */
  if(!guesses.length){
    toast(msg('typeAllExact', [String(exact)]));
    return;
  }
  const was = btn.textContent;
  btn.disabled = true;
  let okCount = 0;
  let stopped = false;
  for(let i = 0; i < guesses.length; i++){
    btn.textContent = msg('typeCheckingN', [String(i + 1), String(guesses.length)]);
    const p = guesses[i];
    const res = await send({ cmd:'typeCheck', proxy:{
      ip: p.ip, port: p.port, login: p.login || '', pass: p.pass || '', type: normType(p.type),
    }});
    if(res.ok){
      verifiedTypes.set(hostPort(p), normType(res.type));
      okCount++;
    } else if(res.error === 'enabled'){
      stopped = true;
      toast(msg('typeNeedOff'), true);
      break;
    }
  }
  btn.disabled = false;
  btn.textContent = was;
  renderBulkPreview();
  if(stopped) return;
  if(!okCount){
    toast(msg('typeAllFailed'), true);
    return;
  }
  /* 2.3: если часть строк была точной из схемы — говорим и про них,
     чтобы число в тосте сходилось со списком на экране */
  toast(exact ? msg('typeCheckedMix', [String(okCount), String(exact)]) : msg('typeChecked', [String(okCount)]));
});

$('#btnBulk').addEventListener('click', () => {
  const { found, skipped } = parseBulk(bulk.value);   /* 2.1: с проверенными типами */
  if(!found.length){ bulk.classList.add('bad'); toast(msg('noneFound')); return; }
  /* этап 4: нераспознанные строки остаются в поле — видно, что именно
     не понято; тост называет число */
  bulk.value = skipped.join('\n');
  bulk.dispatchEvent(new Event('input'));
  addProxies(found, skipped.length);
});

/* полями */
$('#segType').addEventListener('click', e => {
  const b = e.target.closest('button[data-type]'); if(!b) return;
  addType = normType(b.dataset.type);
  $$('#segType button').forEach(x => x.setAttribute('aria-pressed', x === b));
  syncTypeNote();
});

/* 2.1: подпись под селектором — про выбранный протокол. У SOCKS5 и SOCKS4
   Chrome не передаёт логин и пароль, и это единственное, что человеку
   нужно знать до нажатия «Добавить». */
function syncTypeNote(){
  const el = $('#typeNote'); if(!el) return;
  el.textContent = msg(addType === 'SOCKS5' || addType === 'SOCKS4' ? 'noteProtoSocks' : 'noteProto');
}

/* адрес: настоящий IPv4, имя хоста либо IPv6 (без скобок — поле одно на
   адрес) — isValidAddr из parse.js, та же проверка, что у вставки; порт —
   число в границах схемы (этап 4: parseInt всегда). Пустой адрес — «нужны
   адрес и порт», непохожий на адрес — отдельный текст */
const okAddr = ip => isValidAddr(ip);
const okPortStr = port => /^\d{1,5}$/.test(port) && parseInt(port, 10) >= 1 && parseInt(port, 10) <= 65535;
const addrFail = (ip, okIp) => toast(msg(ip && !okIp ? 'badAddr' : 'needAddrPort'), ip && !okIp);   /* 7К.2 (уборка Д-8): третий параметр не читался */
$('#btnAdd').addEventListener('click', () => {
  const ip = $('#fIp').value.trim(), port = $('#fPort').value.trim();
  const okIp = okAddr(ip), okPort = okPortStr(port);
  $('#fIp').classList.toggle('bad', !okIp);
  $('#fPort').classList.toggle('bad', !okPort);
  if(!okIp || !okPort){ addrFail(ip, okIp); return; }
  /* 2.1: тип — выбранный сегмент, не литерал */
  addProxies([{ ip, port,
    login: $('#fLogin').value.trim(), pass: $('#fPass').value.trim(),
    type: addType, src: 'manual' }]);
  ['fIp','fPort','fLogin','fPass'].forEach(i => $('#' + i).value = '');
});

/* 2.1: проверить протокол сохранённой строки. Прокси должен быть
   выключен — проверка на время ставит пробную настройку браузера.
   Найденный тип записывается в строку и снимает метку догадки. */
async function checkTypeOf(id){
  const p = proxies.find(x => x.id === id);
  if(!p) return;
  closeMenus();
  if(st.enabled){ toast(msg('typeNeedOff'), true); return; }
  toast(msg('typeChecking'));
  const res = await send({ cmd:'typeCheck', proxy:{
    ip: p.ip, port: p.port, login: p.login || '', pass: p.pass || '', type: normType(p.type),
  }});
  if(!res.ok){
    /* 2.6: у адреса с логином вероятная причина отказа — не мёртвый хост, а
       невозможность авторизоваться в SOCKS; текст говорит прямо об этом */
    toast(res.error === 'enabled' ? msg('typeNeedOff')
        : p.login ? msg('typeFixSocksHint')
        : msg('typeCheckFail'), true);
    return;
  }
  const upd = { ...p, type: normType(res.type), typeVerified: true };
  delete upd.typeGuess;   /* проверка отменяет догадку: подсказка теперь про проверку */
  proxies = proxies.map(x => x.id === p.id ? upd : x);
  try{ await state.setProxies(proxies); }
  catch(err){ storageFail(err); return; }
  renderList(); renderHero();
  toast(msg('typeFound', [normType(res.type)]));
}

/* ── редактирование: строка раскрывается на месте ── */
function openEdit(id, focusLogin){
  const p = proxies.find(x => x.id === id); if(!p) return;
  closeMenus(); closeGeoPick();
  if(listTab !== 'list') setListTab('list');
  editId = id;
  editDraft = { ip:p.ip, port:String(p.port), login:p.login, pass:p.pass, type:normType(p.type) };   /* этап 4: порт в поле — строкой, в записи — числом; 2.1: тип — известный из четырёх */
  if(!showAll) page = Math.floor(visibleList().findIndex(x => x.id === id) / PER_PAGE) + 1 || 1;
  renderList();
  const f = $(focusLogin ? '#edLogin' : '#edIp');
  if(f){ f.focus(); f.select(); }
}

function cancelEdit(){
  if(editId === null) return;
  editId = null; editDraft = null;
  renderList();
}

function saveEdit(){
  const p = proxies.find(x => x.id === editId); if(!p) return;
  const ip = editDraft.ip.trim(), port = editDraft.port.trim();
  const okIp = okAddr(ip), okPort = okPortStr(port);
  $('#edIp')?.classList.toggle('bad', !okIp);
  $('#edPort')?.classList.toggle('bad', !okPort);
  if(!okIp || !okPort){ addrFail(ip, okIp); return; }

  /* сменили адрес — это уже не тот прокси, что пришёл из
     proxys.io: страна и срок относились к прежнему IP, дальше
     строка живёт как добавленная вручную (поля срока, бессрочности,
     заказа и «нет в аккаунте» — только у 'pxs') */
  const upd = { ...p, ip, port: parseInt(port, 10),
    login: editDraft.login.trim(), pass: editDraft.pass.trim(), type: normType(editDraft.type) };
  /* 2.1: тип выбрал человек — это уже не догадка; метку снимаем */
  delete upd.typeGuess;
  /* 2.1: «проверено» относилось к прежнему адресу и прежнему типу. Сменили
     любой из них — метка больше не про эту запись, иначе подсказка чипа
     говорила бы о проверке, которой для нового адреса не было. */
  if(ip !== p.ip || upd.port !== p.port || upd.type !== normType(p.type)) delete upd.typeVerified;
  if(ip !== p.ip && p.src === 'pxs'){
    upd.src = 'manual';
    delete upd.cc; delete upd.exp; delete upd.expUnlimited; delete upd.orderId; delete upd.gone;
  }
  /* 2.4: страна и город были определены по ПРЕЖНЕМУ адресу — у нового
     адреса они чужие. Снимаем только автоматические (ccAuto): страну,
     выбранную человеком, правка адреса не отменяет — он просил именно её. */
  if(ip !== p.ip && p.ccAuto === true){
    delete upd.cc; delete upd.city; delete upd.ccAuto;
  }
  const list = proxies.map(x => x.id === p.id ? upd : x);

  delete pings[p.id];        /* старый замер больше не про этот прокси */
  heroErr = null;
  const wasOn = (p.id === activeProxyId && st.enabled);   /* 3Б.6: звалась reconnect и затеняла функцию reconnect() */
  editId = null; editDraft = null;

  proxies = list;
  renderList();
  /* этап 4: сначала запись, потом переподключение через фон с новыми
     адресом и кредами */
  state.setProxies(list).then(() => {
    if(wasOn) connect(p.id, msg('reconnected'));
    else renderHero();
  }).catch(storageFail);
  toast(msg('saved'));
}

/* черновик обновляется на каждый ввод — правки переживают
   любые перерисовки списка (чекер, массовая проверка и т.д.) */
$('#rows').addEventListener('input', e => {
  /* перерисовываем только строки списка стран: перерисуй мы весь
     список прокси — поле ввода теряло бы фокус на каждой букве */
  if(e.target.id === 'gpQ'){
    geoQuery = e.target.value;
    const p = proxies.find(x => x.id === geoPickFor);
    const box = e.target.closest('.geo-pick')?.querySelector('.gp-list');
    if(p && box) box.innerHTML = gpRows(p);
    return;
  }
  const f = e.target.closest('.ed-inp'); if(!f || !editDraft) return;
  editDraft[f.dataset.ed] = f.value;
  f.classList.remove('bad');
});

/* ── ПО КЛЮЧУ: ПЯТЬ ЭКРАНОВ ─────────────────────────────────
   Ключ не «загружает всё», а показывает, что есть в аккаунте:
   решает человек. Отсюда состояния — ввод → загрузка → выбор,
   плюс две тупиковые ветки: отказ и пустой список. Все живут в
   одной .fgrid и переключаются атрибутом hidden. */
let keyState = 'input';        /* input | load | pick | err | empty */
let keyErr   = 'bad';          /* bad | expired | empty | net — 7И (правка человека 24.09): empty — код API 1002, заказов не найдено */
let keyPicked = new Set();     /* индексы отмеченных строк accountProxies */
let keyGen = 0;                /* этап 6: поколение загрузки — ответ фону засчитывается только своему */

/* Четыре причины отказа — четыре разных текста. «Что-то пошло не так»
   человеку не помогает: у каждой причины своё следующее действие. 7И: 'empty'
   — по ключу заказов не найдено (kErrEmpty; путь тот же, что у 'bad':
   ключ не привязан) */
const KEY_ERR_TEXT = { bad:'kErrBad', expired:'kErrExpired', empty:'kErrEmpty', net:'kErrNet' };
const keyErrText = () => msg(KEY_ERR_TEXT[keyErr] || 'kErrNet');
const KCHK = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3.2 8.4 3.2 3.2 6.4-7"/></svg>';

/* «уже добавлен» считаем по паре ip:порт — тем же ключом, что и
   дубликаты в футере списка */
const inList   = a => proxies.some(p => p.ip === a.ip && p.port === a.port);
const accFresh = () => accountProxies.filter(a => !inList(a));

function accExp(a){
  if(!a.exp) return { c:'', t:'' };   /* этап 6: бессрочный (exp: null) и «срока не знаем» — без подписи, как в списке; иначе 1970 год читался бы как «истёк» */
  const d = expDays(a);   /* 3Б.3: та же expDays из format.js, а не вторая копия Math.ceil от Date.now() */
  if(d < 0)  return { c:' bad',  t:msg('kExpOut') };
  if(d <= EXP_BAD_DAYS)  return { c:' bad',  t:expLabel(d) };
  if(d <= EXP_WARN_DAYS) return { c:' warn', t:expLabel(d) };
  return { c:'', t:msg('kUntil', [new Date(a.exp).toLocaleDateString(DATE_LOCALE)]) };   /* 3Б.3: язык браузера вместо lang; 3Б.6: DATE_LOCALE */
}

function setKeyState(st){
  keyState = st;
  /* состояние на контейнере: по нему CSS решает, прижать
     содержимое к верху или растянуть на колонку (см. #am-key) */
  $('#am-key').dataset.st = st;
  ['input','load','pick','err','empty'].forEach(x => $('#kSt-' + x).hidden = (x !== st));
  if(st === 'err') $('#kErrT').textContent = keyErrText();
  if(st === 'pick') renderKeyPick();
}

function renderKeyPick(){
  const total = accountProxies.length;
  $('#kpCnt').textContent = msgN('kFound', total);
  $('#kpList').innerHTML = accountProxies.map((a, i) => {
    const had = inList(a), on = !had && keyPicked.has(i), x = accExp(a);
    return `<div class="kp-row${had ? ' had' : ''}" data-kp="${i}" role="checkbox"
         aria-checked="${on}" aria-disabled="${had}" tabindex="${had ? -1 : 0}">
      <span class="kp-box${on ? ' on' : ''}" aria-hidden="true">${KCHK}</span>
      ${flag(a.cc)}
      <span class="kp-ip">${esc(a.ip)}<span class="dt">:</span><span class="pt">${esc(a.port)}</span></span>
      ${had ? `<span class="kp-had">${msg('kHad')}</span>` : ''}
      <span class="kp-x${x.c}">${x.t}</span>
    </div>`;
  }).join('');
  const n = [...keyPicked].filter(i => !inList(accountProxies[i])).length;
  $('#btnKeySel').textContent = msg('kAddSel', [String(n)]);
  $('#btnKeySel').disabled = !n;
  $('#btnKeyAll').disabled = !accFresh().length;
}

/* Этап 6: ключ уходит фону — команда keyLoad с полем key; он ходит в API,
   проверяет ключ и, если ответ удачный, сам пишет settings.apiKey и кеш
   account. Ответ фона засчитывается только своему поколению keyGen и
   только пока экран в состоянии «загрузка»: «Отвязать» и новый запуск
   поднимают поколение, и устаревший ответ не показывает экран выбора
   (аудит 3Б.4). Четыре причины отказа — четыре текста (kErrBad, kErrExpired,
   kErrEmpty — 7И, kErrNet); «фон не ответил» и «команда упала» читаются как
   отказ сети */
function runKeyLoad(){
  const key = $('#fKey').value.trim();
  if(!key){ setKeyState('input'); $('#fKey').focus(); return; }
  const gen = ++keyGen;
  setKeyState('load');
  send({ cmd:'keyLoad', key }).then(r => {
    if(gen !== keyGen || keyState !== 'load') return;
    if(r.ok){
      accountProxies = Array.isArray(r.items) ? r.items : [];
      /* по умолчанию отмечены все, кроме уже добавленных:
         чаще всего человеку нужен весь аккаунт */
      keyPicked = new Set(accountProxies.map((a, i) => i).filter(i => !inList(accountProxies[i])));
      setKeyState(accountProxies.length ? 'pick' : 'empty');
    } else {
      keyErr = (r.error === 'bad' || r.error === 'expired' || r.error === 'empty') ? r.error : 'net';   /* 7И: empty — те же пути, что bad */
      setKeyState('err');
    }
    renderSettings();
  });
}

/* добавленные по ключу живут как 'pxs': им сами приезжают срок
   и страна, поэтому логин и пароль берём из аккаунта, а не с
   формы — в реальном ответе API они приходят вместе с адресом.
   Этап 4: демо-креды сняты; поля берутся из записи аккаунта, которую
   собирает api.js в нормализованной форме. Этап 6: в запись уходит и
   orderId — по нему (вместе с адресом) обновление в фоне находит прокси */
function addFromAccount(items){
  if(!items.length) return;
  addProxies(items.map(a => ({
    ip:a.ip, port:a.port, login:a.login || '', pass:a.pass || '', type:'HTTP',
    src:'pxs', ...(a.cc ? { cc:a.cc } : {}), exp:a.exp ?? null, expUnlimited:!!a.expUnlimited,
    ...(Number.isInteger(a.orderId) ? { orderId:a.orderId } : {}) })));
  keyPicked.clear();
  renderKeyPick(); renderSettings();
}

$('#btnKey').addEventListener('click', () => {
  const key = $('#fKey');
  if(!key.value.trim()){ key.classList.add('bad'); toast(msg('pasteKey')); return; }
  key.classList.remove('bad');
  runKeyLoad();
});

$('#am-key').addEventListener('click', e => {
  if(e.target.closest('[data-kback]')){ setKeyState('input'); $('#fKey').focus(); return; }
  if(e.target.closest('[data-kretry]')){ runKeyLoad(); return; }
  const all = e.target.closest('[data-kall]');
  if(all){
    keyPicked = all.dataset.kall === '1'
      ? new Set(accountProxies.map((a, i) => i).filter(i => !inList(accountProxies[i])))
      : new Set();
    renderKeyPick();
    return;
  }
  if(e.target.closest('#btnKeySel')){
    addFromAccount([...keyPicked].sort((a, b) => a - b)
      .map(i => accountProxies[i]).filter(a => !inList(a)));
    return;
  }
  if(e.target.closest('#btnKeyAll')){ addFromAccount(accFresh()); return; }
  const row = e.target.closest('[data-kp]');
  if(row && row.getAttribute('aria-disabled') !== 'true'){
    const i = +row.dataset.kp;
    keyPicked.has(i) ? keyPicked.delete(i) : keyPicked.add(i);
    renderKeyPick();
  }
});
$('#am-key').addEventListener('keydown', e => {
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest('[data-kp]');
  if(row && row.getAttribute('aria-disabled') !== 'true'){
    e.preventDefault();
    const i = +row.dataset.kp;
    keyPicked.has(i) ? keyPicked.delete(i) : keyPicked.add(i);
    renderKeyPick();
    $(`[data-kp="${i}"]`)?.focus();
  }
});

document.addEventListener('click', e => {
  if(!e.target.closest('.mwrap')) closeMenus();
  /* 3Б.3: оговорки про клик по стенду нет — стенда в расширении нет,
     как и обещал комментарий прототипа */
  /* список стран живёт внутри строки, поэтому закрываем его по
     клику мимо всей метки, а не мимо самого списка */
  /* Карточку мы сносим сразу, ещё до того как клик долетит
     сюда: её кнопка к этому моменту уже вне .geo-wrap, и по
     одному только .geo-wrap список закрылся бы, не успев
     открыться. Поэтому проверяем и саму карточку, и кнопку. */
  if(!e.target.closest('.geo-wrap') && !e.target.closest('.geo-hint')
     && !e.target.closest('[data-geopick]') && !e.target.closest('[data-geohero]')){
    hideGeoHint(true);
    if(closeGeoPick()) renderList();
  }
});
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  closeMenus();
  if(closeGeoPick()) renderList();
  cancelEdit();
  /* подсказку держит фокус — Escape её и закрывает; 7Е: пузырь data-tip
     закрывается и тот, что открыт наведением, — hideTip() */
  hideGeoHint(true);
  if(document.activeElement?.hasAttribute?.('data-tip')) document.activeElement.blur();
  hideTip();
});

/* ── настройки ── */
/* 3Б.6: из таблицы сняты два значка без потребителя — «дом» и «клавиатура»:
   в прототипе к ним никто не обращался (решение 08.09, проход Б) */
const I = {
  shield:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.8 13.4 4v4.1c0 3.4-2.3 5.6-5.4 6.7-3.1-1.1-5.4-3.3-5.4-6.7V4z"/></svg>`,
  pulse:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.6 8.2h2.5L6 3.4l4 9.2 1.9-4.4h2.5"/></svg>`,
  swap:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.7 11.4h2.4c.9 0 1.7-.4 2.2-1.1l3.1-4.6c.5-.7 1.3-1.1 2.2-1.1h2"/><path d="M1.7 4.6h2.4c.7 0 1.3.2 1.8.7"/><path d="M9 10.7c.5.4 1.1.7 1.7.7h2.9"/><path d="m11.9 2.3 2.2 2.3-2.2 2.3"/><path d="m11.9 9.1 2.2 2.3-2.2 2.3"/></svg>`,
  reload:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.4 8A5.4 5.4 0 1 1 11.8 4.2"/><path d="M13.6 1.6v2.8h-2.8"/></svg>`,
  boot:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M6.7 5.6v4.8L10.5 8z"/></svg>`,
  clock:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.3 1.5"/></svg>`,
  eyeoff:iconEyeOff(17),   /* 3Б.6: из icons.js, см. eyeOff героя */
  key:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="5" r="2.8"/><path d="m7.1 7.1 6.3 6.3"/><path d="m10.3 10.3 1.5-1.5"/><path d="m12.4 12.4 1.5-1.5"/></svg>`,
  reset:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a5 5 0 1 1 1.5 3.6"/><path d="M3 12.2V8.6h3.6"/></svg>`,
  /* этап 6: две дуги со стрелками — обновление из аккаунта; штрихи и
     размеры как у соседей (16×16, 1.5, скруглённые концы) */
  sync:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.4 8A5.4 5.4 0 0 0 4.2 4.2"/><path d="M7.2 4.2H4.2V1.2"/><path d="M2.6 8a5.4 5.4 0 0 0 9.2 3.8"/><path d="M8.8 11.8h3v3"/></svg>`,
  /* 7Ж: значки блока «Проксирование по сайтам» */
  site:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M1.9 8h12.2"/><path d="M8 1.8c2.1 2 2.1 10.4 0 12.4M8 1.8c-2.1 2-2.1 10.4 0 12.4"/></svg>`,
  count:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 13.2V9.4"/><path d="M6.2 13.2V5.6"/><path d="M9.8 13.2V7.8"/><path d="M13.5 13.2V3.2"/></svg>`,
  /* 7Д: клавиатура — тумблер «Горячие клавиши» (тот же рисунок, что у
     вкладки в разметке, 17px); снятый на 3Б.6 значок I.kbd вернулся с
     потребителем */
  kbd:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1.8" y="4" width="12.4" height="8" rx="1.6"/><path d="M4.4 6.9h.01M7 6.9h.01M9.6 6.9h.01M12.2 6.9h.01M4.6 9.3h6.8"/></svg>`,
  /* 7З: колокольчик — строка «Уведомления о сроках» блока «Аккаунт» (тот же
     рисунок, что у пустой панели попапа, в сетке 16) */
  bell:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 10.6c-.7-.8-1.1-1.9-1.1-3V6.4a3.4 3.4 0 0 0-6.8 0v1.2c0 1.1-.4 2.2-1.1 3l-.6.7h10.2z"/><path d="M6.7 13a1.4 1.4 0 0 0 2.6 0"/></svg>`,
  /* 2.4: флаг — строка «Страна по IP» блока «Соединение» */
  flag:`<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.6 14V2.4"/><path d="M3.6 3h8.8l-1.6 2.8 1.6 2.8H3.6z"/></svg>`,
};
/* 7З (правка человека 22.09, 1): колокольчики строк выпадающего списка прокси
   в строке «Уведомления о сроках» — те же два рисунка, что у колокольчика
   попапа (BELL_ON / BELL_OFF в popup.js, сетка 20), в 16px: включён — целый,
   выключен — перечёркнутый */
const BELL_ON  = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 13.3c-.9-1-1.4-2.4-1.4-3.8V8a4.2 4.2 0 0 0-8.4 0v1.5c0 1.4-.5 2.8-1.4 3.8l-.7.8h12.6z"/><path d="M8.4 16.2a1.7 1.7 0 0 0 3.2 0"/></svg>';
const BELL_OFF = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14.2 9.5V8a4.2 4.2 0 0 0-6.9-3.2M5.9 5.9c-.05.2-.1.5-.1.7v2.9c0 1.4-.5 2.8-1.4 3.8l-.7.8h11"/><path d="M8.4 16.2a1.7 1.7 0 0 0 3.2 0"/><path d="m3.2 3.2 13.6 13.6"/></svg>';
const TZ_GLOBE = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4"/><path d="M8 1.8c1.7 1.9 1.7 10.5 0 12.4M8 1.8c-1.7 1.9-1.7 10.5 0 12.4"/></svg>';
const NS_CHEV  = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3.6 6.2 4.4 4.4 4.4-4.4"/></svg>';

/* в таблице — только ключ и значок: заголовок и описание живут
   в словаре (L.set), иначе их пришлось бы держать в двух местах
   3Б.3: в messages.json это плоские ключи setWebrtcT / setWebrtcD и так
   далее — имя собирается из ключа таблицы, см. swRow */
const cap = s => s[0].toUpperCase() + s.slice(1);   /* 3Б.3: 'webrtc' → 'Webrtc' для имени ключа словаря */
/* 2.1: строка «Протокол прокси» — не тумблер, а действие: проверка типа
   активного прокси. В общей сетке .opt она стоит там же, где тумблеры,
   но вместо переключателя — кнопка (extra). Почему в настройках: тип
   выбирается при вставке и проверяется кнопкой, а «где это включить» —
   вопрос, который человек ищет в настройках. */
const SET_TYPE = { k:'protocol', ic:'swap' };
const SET_CONN = [
  { k:'webrtc',   ic:'shield', pin:true },
  { k:'verify',   ic:'pulse'  },
  { k:'failover', ic:'swap'   },
  { k:'tz',       ic:'clock'  },   /* 2.2: пояс страниц по IP активного прокси */
  { k:'geoAuto',  ic:'flag'   },   /* 2.4: страна по адресу — флаг и название в строке */
  { k:'reload',   ic:'reload' },
  { k:'restore',  ic:'boot'   },
];
/* 7Г (решение человека 17.09): тумблер badge «Флаг страны на значке»
   снят вместе со значком-флажком — флага на значке нет: логотип не
   заслоняем, у большинства один-два прокси, значок мал. Поле settings.badge
   снято в state.js и schema.js, ключи setBadgeT/setBadgeD — из словарей */
const SET_UI = [
  { k:'mask',  ic:'eyeoff' },
];
/* 7Ж (18.09): блок «Проксирование по сайтам» — главный тумблер siteRow
   (строка «Прокси для:» в окне) и подстройка siteTrack (учёт запросов
   страницы). Подстройка недоступна (aria-disabled), пока выключен
   siteRow: без строки счёту негде показываться.
   7З (23.09): строка siteNotify («Уведомлять о сбоях загрузки», отложена
   18.09) снята решением человека — сбой и так виден в плашке строки
   «Прокси для:», отдельная карточка и настройка не нужны */
const SET_SITE = [
  { k:'siteRow',   ic:'site',  main:true },
  { k:'siteTrack', ic:'count', needs:'siteRow' },
];
/* этап 6 (решение человека 10.09, отклонение от прототипа): тумблер
   «Обновлять список из аккаунта» — отдельная группа блока «Аккаунт»,
   под ключом, а не строка SET_UI: это про аккаунт, не про интерфейс.
   Рядом кнопка «Обновить сейчас» — только при привязанном ключе */
const SET_ACC = [
  { k:'autoUpdate', ic:'sync' },
];
/* 7З (решение человека 22.09; правка человека 22.09 после 7З-2): строка
   «Уведомления о сроках» блока «Аккаунт» — своя сетка (.opt.ns): значок,
   текст, и органы в третьей колонке — строка с выпадающим списком всех
   прокси (у каждого справа колокольчик, как в попапе: включён или выключен)
   и под ней сегментный переключатель области той же ширины и высоты (как
   селектор режима списков, не четыре тумблера). Список сверху, селектор
   снизу (правка человека 22.09 после 7З-4): список раскрывается вверх и
   селектор не перекрывает. На узких экранах органы уходят под текст, в
   колонку текста, а не под значок (правка 3).
   «Выбранные» и «Все в аккаунте» действуют только при привязанном ключе:
   без него заперты (aria-disabled, подсказка «нужен ключ API» — как у кнопок
   протокола, не disabled: иначе ни ховера, ни подсказки), записанное
   положение показывается запертым и действует как «Добавленные» (ответ
   проверяющего чата 22.09, 6).
   Список прокси и колокольчики по области (правка 1): «Выкл» — строка
   заперта, не открывается; «Добавленные» — открыть можно посмотреть,
   добавленные по ключу отмечены, остальные из аккаунта заперты;
   «Выбранные» — все прокси по ключу (добавленные и из аккаунта) включаются
   и выключаются, отмеченные — settings.notifWatch; «Все в аккаунте» — всё
   отмечено и заперто, но список открывается. Ручные заперты целиком при
   любой области — срока у них нет, уведомлять не о чем. В строке списка —
   «Отмечено N из M» (M — прокси по ключу) */
const NS_KEY = { off:'setNotifScopeOff', added:'setNotifScopeAdded', picked:'setNotifScopePicked', all:'setNotifScopeAll' };
const needsKey = m => m === 'picked' || m === 'all';
const watchKey = a => `${a.ip}:${a.port}`;   /* строка notifWatch — та же форма, что addr в notifs.js */
/* область, которая действует: без ключа или аккаунта 'picked' и 'all' работают как 'added' */
const nsActive = () => needsKey(settings.notifScope) && !(apiLinked() && account && !account.error) ? 'added' : settings.notifScope;
/* строки списка: прокси списка (по ключу и ручные) и адреса аккаунта, которых в
   списке нет; одна пара ip:port — одна строка */
function nsEntries(){
  const out = [], have = new Set();
  for(const p of proxies){
    const key = watchKey(p);
    if(have.has(key)) continue;
    have.add(key);
    out.push({ key, ip:p.ip, port:p.port, cc:p.cc, src:p.src === 'pxs' ? 'pxs' : 'manual' });
  }
  if(apiLinked() && account && !account.error){
    for(const a of accountProxies){
      const key = watchKey(a);
      if(have.has(key)) continue;
      have.add(key);
      out.push({ key, ip:a.ip, port:a.port, cc:a.cc, src:'acc' });
    }
  }
  return out;
}
/* положение колокольчика строки: on — включён, lock — переключать нельзя */
function nsRowState(e, scope, watch){
  if(e.src === 'manual') return { on:false, lock:true };
  if(scope === 'off') return { on:false, lock:true };
  if(scope === 'all') return { on:true, lock:true };
  if(scope === 'added') return { on:e.src === 'pxs', lock:true };
  return { on:watch.has(e.key), lock:false };   /* picked */
}
/* 7З: адреса, которых больше нет ни в списке, ни в аккаунте, вычищаются из
   notifWatch при отрисовке настроек (решение сессии, DECISIONS при закрытии):
   фон список не трогает, а страница видит и список, и свежий кеш аккаунта.
   Только при аккаунте без ошибки — при отказе ключа кеш старый, судить по
   нему нельзя. Аккаунт и настройки приходят разными записями хранилища,
   сравнение — с тем, что видно на момент отрисовки */
function pruneWatch(){
  if(!(apiLinked() && account && !account.error) || !settings.notifWatch.length) return;
  const have = new Set(nsEntries().map(e => e.key));
  const kept = settings.notifWatch.filter(k => have.has(k));
  if(kept.length !== settings.notifWatch.length) writeSetting({ notifWatch: kept });
}
function nsRowsHtml(entries, scope, watch){
  return entries.map(e => {
    const st = nsRowState(e, scope, watch);
    const cap = e.src === 'acc' ? msg('accNotifAcc') : e.src === 'manual' ? msg('accNotifManual') : '';
    const tip = st.lock ? '' : msg(st.on ? 'accNotifUnmark' : 'accNotifMark');
    /* оба колокольчика в разметке, показывается один по классу строки: при
       щелчке по самой иконке узел под курсором НЕ должен исчезать — иначе
       клик, всплыв до document, читался бы как клик мимо меню и закрывал
       список (находка человека 22.09, баг 1) */
    return `<button class="nsm-row${st.on ? ' on' : ''}${st.lock ? ' lock' : ''}" data-nsrow="${esc(e.key)}" role="menuitemcheckbox" aria-checked="${st.on}"${st.lock ? ' disabled' : ''}${tip ? ` title="${esc(tip)}"` : ''}>
      ${e.cc ? flag(e.cc) : ''}<b>${esc(e.ip)}<span class="dt">:</span><span class="pt">${esc(e.port)}</span></b>${cap ? `<i>${cap}</i>` : ''}<span class="nsm-bell">${BELL_ON}${BELL_OFF}</span>
    </button>`;
  }).join('');
}
function notifScopeRow(){
  const linked = apiLinked();
  const scope = settings.notifScope;
  const act = nsActive();
  const entries = nsEntries(), watch = new Set(settings.notifWatch);
  const keyed = entries.filter(e => e.src !== 'manual').length;
  const marked = entries.filter(e => nsRowState(e, act, watch).on).length;
  return `
    <div class="opt ns">
      <span class="opt-i${scope !== 'off' ? ' ok' : ''}">${I.bell}</span>
      <div class="opt-t">
        <h3>${msg('setNotifScopeT')}</h3>
        <p>${msg('setNotifScopeD')}</p>
        ${!linked ? `<p class="set-sub">${msg('accNotifNoKeyD')}</p>` : ''}
      </div>
      <div class="ns-ctl">
        <div class="mwrap ns-dd">
          <button class="ns-dd-btn" data-nsdd aria-haspopup="menu" aria-expanded="false"${act === 'off' ? ' aria-disabled="true"' : ''} aria-label="${esc(msg('accNotifDd'))}"><span>${msg('accNotifOfN', [String(marked), String(keyed)])}</span>${NS_CHEV}</button>
          <div class="menu nsm" role="menu" hidden><div class="nsm-list">${entries.length ? nsRowsHtml(entries, act, watch) : `<p class="gp-none">${msg('accNotifNone')}</p>`}</div></div>
        </div>
        <div class="seg ns-seg" role="group" aria-label="${esc(msg('setNotifScopeT'))}">
          ${NOTIF_SCOPES.map(m => `<button data-ns="${m}" aria-pressed="${scope === m}"${needsKey(m) && !linked ? ` aria-disabled="true" data-tip="${esc(msg('accNotifNoKey'))}"` : ''}>${msg(NS_KEY[m])}</button>`).join('')}
        </div>
      </div>
    </div>`;
}
/* 7З (находка человека 22.09, баг 2): список открывается вниз, если
   помещается в окно, иначе вверх — строка стоит в последнем блоке страницы, и
   открытый вниз список упирался в нижний край окна и растягивал страницу.
   Меряется по месту при каждом открытии (и при повторном открытии после
   перерисовки), как пузырь подсказки: вверх, если внизу не помещается, а
   вверху помещается */
function nsDdShow(dd){
  const menu = dd.nextElementSibling;
  menu.hidden = false;
  dd.setAttribute('aria-expanded', 'true');
  const r = dd.getBoundingClientRect(), need = menu.offsetHeight + 6, vh = document.documentElement.clientHeight;
  menu.classList.toggle('up', r.bottom + need > vh - 8 && r.top - need > 8);
}
/* 7З: колокольчик строки списка — отметить или снять адрес в notifWatch (только
   при действующей области «Выбранные»); не больше NOTIF_WATCH_MAX. Строка и
   подпись «N из M» правятся НА МЕСТЕ, без перерисовки списка: клик ещё
   всплывает до document, и снесённая строка читалась бы как клик мимо меню
   (закрыло бы список — та же ловушка, что у карточки страны). Полную
   перерисовку принесёт эхо записи; открытый список и фокус она сохраняет */
function toggleWatch(key){
  const watch = settings.notifWatch;
  if(watch.includes(key)) writeSetting({ notifWatch: watch.filter(k => k !== key) });
  else if(watch.length >= NOTIF_WATCH_MAX){ toast(msg('accNotifLimit', [String(NOTIF_WATCH_MAX)]), true); return; }
  else writeSetting({ notifWatch: [...watch, key] });
  const on = settings.notifWatch.includes(key);
  const row = $(`#setAcc [data-nsrow="${key}"]`);
  if(row){
    row.classList.toggle('on', on);   /* иконку меняет класс — узлы на месте */
    row.setAttribute('aria-checked', String(on));
    row.title = msg(on ? 'accNotifUnmark' : 'accNotifMark');
  }
  const act = nsActive(), entries = nsEntries(), w = new Set(settings.notifWatch);
  const lbl = $('#setAcc .ns-dd-btn span');
  if(lbl) lbl.textContent = msg('accNotifOfN', [String(entries.filter(e => nsRowState(e, act, w).on).length), String(entries.filter(e => e.src !== 'manual').length)]);
}

/* ТРЕТЬЕ СОСТОЯНИЕ WEBRTC. Блокировка требует разрешения
   браузера, и человек может в нём отказать. Тумблер тогда
   остаётся выключенным — рисовать «включено» нельзя, защиты-то
   нет, — а под описанием появляется строка о том, что делать
   дальше. Отказ — не настройка, а факт про браузер, поэтому в
   settings ему не место: он живёт в памяти окна (webrtcDenied и
   privacyOk выше; 7А — с настоящим chrome.permissions.request). */
const DENY_I = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="6.6" rx="1.6"/><path d="M5.4 7V5.2a2.6 2.6 0 0 1 5.2 0V7"/></svg>';
const denyLine = () => `<p class="opt-deny">${DENY_I}${msg('webrtcDeny')}</p>`;
/* 2.2: строка состояния под описанием «Часовой пояс по IP прокси». Пояс
   выбирает фон (src/background/tz.js), окно только показывает: найден и
   подставлен / ищем / не нашли / включится вместе с прокси. Отдельная
   строка, а не текст описания: описание — про смысл настройки, строка —
   про её текущее состояние. */
function tzLine(){
  let text = '', tone = '';
  if(st.tzStatus === 'on' && st.tzZone){
    let off = '';
    try { off = ` · ${zoneOffsetLabel(st.tzZone)}`; } catch(err){}
    text = msg('tzRowOn', [st.tzZone]) + off;
  } else if(st.tzStatus === 'looking'){
    text = msg('tzRowLooking'), tone = ' mute';
  } else if(st.tzStatus === 'fail' && st.enabled){
    text = msg('tzRowFail'), tone = ' warn';
  } else {
    text = msg('tzRowIdle'), tone = ' mute';
  }
  return `<p class="opt-tz${tone}" data-tzline>${TZ_GLOBE}${esc(text)}</p>`;
}
/* 2.1: откуда взялся тип — три разных подсказки, чтобы чип не врал.
   Проверенный тип — факт; тип из схемы адреса — факт, но из строки
   вставки; тип по порту — догадка со звёздочкой. */
function typeTip(p){
  if(p.typeGuess === true) return msg('typeGuessTip');
  if(p.typeVerified === true) return msg('typeVerifiedTip');
  return msg('typeExactTip');
}

function swRow(o){
  const warn = o.k === 'webrtc' && !webrtcOn();
  const deny = o.k === 'webrtc' && webrtcDeny();   /* 7А */
  const ok = o.k === 'webrtc' && webrtcOn();       /* 7Ж (правка человека 18.09): защита включена — значок зелёный, как у списков и строки сайта */
  return `
    <div class="opt">
      <span class="opt-i${warn ? ' warn' : ok ? ' ok' : ''}">${I[o.ic]}</span>
      <div class="opt-t">
        <h3>${msg('set' + cap(o.k) + 'T')}${o.pin ? `<span class="pin">${msg('important')}</span>` : ''}</h3>
        <p>${msg('set' + cap(o.k) + 'D')}</p>
        ${deny ? denyLine() : ''}
        ${o.k === 'tz' && settings.tz ? tzLine() : ''}
      </div>
      ${o.extra ? `<span class="opt-end">${o.extra}` : ''}<button class="sw" role="switch" aria-checked="${o.k === 'webrtc' ? webrtcOn() : settings[o.k]}" data-set="${o.k}" aria-label="${msg('set' + cap(o.k) + 'T')}"></button>${o.extra ? '</span>' : ''}
    </div>`;
}
/* 7Ж: строки блока «Проксирование по сайтам» — главная (siteRow) и одна
   подстрока (siteTrack) со смещением и пунктирной направляющей. Подстрока
   недоступна (aria-disabled, тумблер disabled), пока выключен siteRow:
   значение при этом не меняется — включат строку обратно, прежнее
   действует. Заголовки и описания — плоские ключи setSiteRowT/D и т.д. */
function siteRows(){
  return SET_SITE.map(o => {
    const off = o.needs ? !settings[o.needs] : false;
    return `
    <div class="opt ${o.main ? 'main' : 'sub'}"${off ? ' aria-disabled="true"' : ''}>
      <span class="opt-i${o.main && settings.siteRow ? ' ok' : ''}">${I[o.ic]}</span>
      <div class="opt-t">
        <h3>${msg('set' + cap(o.k) + 'T')}</h3>
        <p>${msg('set' + cap(o.k) + 'D')}</p>
      </div>
      <button class="sw" role="switch" aria-checked="${settings[o.k]}" data-set="${o.k}" aria-label="${msg('set' + cap(o.k) + 'T')}"${off ? ' disabled' : ''}></button>
    </div>`;
  }).join('');
}

/* 7А: строка WebRTC на месте, без перерисовки всех настроек (DOM живёт,
   transition тумблера проигрывается): положение тумблера, оранжевый
   значок, строка под описанием — по тем же правилам, что у swRow */
function syncWebrtcRow(){
  const sw = $('#setConn [data-set="webrtc"]'); if(!sw) return;
  const opt = sw.closest('.opt');
  sw.setAttribute('aria-checked', webrtcOn());
  opt.querySelector('.opt-i').classList.toggle('warn', !webrtcOn());
  opt.querySelector('.opt-i').classList.toggle('ok', webrtcOn());   /* 7Ж: зелёный при включённой защите */
  const line = opt.querySelector('.opt-deny');
  if(webrtcDeny() && !line) opt.querySelector('.opt-t').insertAdjacentHTML('beforeend', denyLine());
  else if(!webrtcDeny() && line) line.remove();
}
/* 2.1: строка «Протокол прокси». Тип активного прокси известен из записи —
   кнопка проверяет его вживую (typecheck.js) и записывает результат в
   запись. Пока прокси включён, проверка невозможна: браузер занят рабочим
   прокси, и typecheck.js отвечает 'enabled'. Поэтому кнопка заперта
   (aria-disabled, не disabled: нужна подсказка, почему), а строка
   состояния говорит, что именно мешает. */
function typeRow(){
  const p = active();
  const type = p ? normType(p.type) : '';
  const locked = Boolean(st.enabled);
  const state = !p ? msg('typeRowNoProxy')
    : locked ? msg('typeRowOn')
    : p.typeVerified === true ? msg('typeRowVerified')
    : p.typeGuess === true ? msg('typeRowGuess')
    : msg('typeRowScheme');
  const btn = p
    ? `<button class="btn-ft" data-typecheck-conn${locked ? ' aria-disabled="true"' : ''}>${msg('typeCheckBtn')}</button>`
    : '';
  return `
    <div class="opt">
      <span class="opt-i">${I[SET_TYPE.ic]}</span>
      <div class="opt-t">
        <h3>${msg('setProtocolT')}</h3>
        <p>${msg('setProtocolD')}</p>
        <p class="opt-tz${locked ? ' mute' : ''}" data-typerow>
          ${p ? `<span class="tp" data-pt="${type}">${esc(typeLabel(p.type, p.typeGuess))}</span>` : ''}
          <span>${esc(state)}</span>
        </p>
      </div>
      ${btn ? `<span class="opt-end">${btn}</span>` : ''}
    </div>`;
}
/* Проверка типа активного прокси из настроек: тот же путь, что у пункта
   меню строки (checkTypeOf) — один договор с фоном и один тост. */
async function checkActiveType(){
  const p = active();
  if(!p){ toast(msg('needProxyFirst'), true); return; }
  if(st.enabled){ toast(msg('typeNeedOff'), true); return; }
  await checkTypeOf(p.id);
  renderSettings();
}

/* 2.2: строка состояния пояса на месте, без перерисовки настроек.
   Выключенный тумблер строки не имеет: состояние поиска без него не
   значит ничего. */
/* 2.1: та же беда у строки протокола — обновляем её одну, когда меняются
   активный прокси, состояние включения или сам тип. */
function syncTypeRow(){
  const row = $('#setConn [data-typerow]');
  if(!row) return;
  const box = row.closest('.opt');
  if(!box) return;
  const html = typeRow();
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const next = holder.firstElementChild;
  if(next) box.replaceWith(next);
}

function syncTzRow(){
  const sw = $('#setConn [data-set="tz"]'); if(!sw) return;
  const opt = sw.closest('.opt');
  const line = opt.querySelector('[data-tzline]');
  if(!settings.tz){ if(line) line.remove(); return; }
  if(line) line.outerHTML = tzLine();
  else opt.querySelector('.opt-t').insertAdjacentHTML('beforeend', tzLine());
}

/* 7А: спросить браузер, есть ли разрешение; узнали новое — перерисовать
   строку. При старте зовётся вместе с чтением хранилища, дальше — по
   подписке на settings (после отзыва фон пишет webrtc: false) */
function checkPrivacy(){
  return chrome.permissions.contains(PRIVACY).then(has => {
    if(has === privacyOk) return;
    privacyOk = has;
    syncWebrtcRow();
  }).catch(err => console.warn('[pxs] не удалось проверить разрешение privacy:', err));
}

/* строка горячей клавиши: заголовок, описание и сочетание.
   7Д: сочетание — строкой от браузера (hkChord ← readShortcuts; пока не
   прочитано или API нет — умолчание из манифеста, hkDefault):
   'Ctrl+Shift+1' — части через «+» рисуются клавишами; пустая строка —
   «не назначено» */
const hkRow = (ico, t, p, chord) => `
  <div class="opt">
    <span class="opt-i">${ico}</span>
    <div class="opt-t"><h3>${t}</h3><p>${p}</p></div>
    <span class="keys">${chord ? chord.split('+').map(k => `<span class="key">${esc(k)}</span>`).join('') : `<span class="key">${msg('hkNone')}</span>`}</span>
  </div>`;
const ICO_PWR  = '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 1.8v5.4"/><path d="M4.2 3.9a5.4 5.4 0 1 0 7.6 0"/></svg>';
/* страница переназначения клавиш зависит от браузера:
   Chromium-семья статична (commands.update у них так и нет),
   у каждого своя служебная страница; Firefox — свой путь в about:addons.
   Firefox и прочие браузеры — после релиза под Chrome. Ветки и ключ
   kbFf оставлены намеренно, это не мёртвый код вне области. */
const KB = (() => {
  const ua = navigator.userAgent;
  if(/Firefox/i.test(ua))   return { url:'about:addons', ff:true };
  if(/YaBrowser/i.test(ua)) return { url:'browser://extensions/shortcuts' };
  if(/OPR\//.test(ua))      return { url:'opera://extensions/shortcuts' };
  if(/Edg\//.test(ua))      return { url:'edge://extensions/shortcuts' };
  return { url:'chrome://extensions/shortcuts' };
})();
/* 3Б.5: здесь была подпись адреса в KB для снятого меню языка —
   присваивалась и нигде не читалась; строка убрана (аудит, проход Б) */
/* 7Д: окно расширения — команда _execute_action открывает попап, как щелчок
   по значку на панели; прежние значки ползунков «настроек» и «выключить»
   (Ctrl+Shift+0) сняты вместе со своими строками */
const ICO_WIN  = '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1.8" y="2.6" width="12.4" height="10.8" rx="1.8"/><path d="M1.8 5.8h12.4"/><path d="M4.2 4.2h.01M6.3 4.2h.01"/></svg>';
/* 3Б.3: ICO_LIST — теперь ICON_LIST из icons.js (в попапе та же иконка стоит копией в разметке у .ls-i, 16px) */

/* ── 7Д · ВКЛАДКА «ГОРЯЧИЕ КЛАВИШИ» (ответы проверяющего чата 21.09, п. 1–2) ──
   Три команды раздела commands манифеста в его порядке: имя команды →
   ключи словаря hk<k>T / hk<k>D и значок. Одно сочетание включает и
   выключает (toggle-proxy); строки «Отключить прокси» (Ctrl+Shift+0) и
   её ключей нет. Сочетания НЕ константы: браузер даёт их переназначить на
   своей странице, поэтому строки берут текущее сочетание у браузера
   (getAll ниже) — карта hkShortcuts (память окна; null — ещё
   не читали или API нет, тогда умолчания из манифеста). Пустое сочетание
   (снято на странице браузера) — «не назначено». Перечитывается при
   старте, при открытии вкладки и при возвращении на страницу. */
const HK_CMDS = [
  { name:'toggle-proxy',    k:'On',   ico:ICO_PWR },
  { name:'next-proxy',      k:'Next', ico:I.swap  },
  { name:'_execute_action', k:'Set',  ico:ICO_WIN },
];
let hkShortcuts = null;
function hkDefault(name){
  const c = chrome.runtime.getManifest().commands;
  const d = c && c[name] && c[name].suggested_key && c[name].suggested_key.default;
  return typeof d === 'string' ? d : '';
}
function hkChord(name){
  if(!hkShortcuts) return hkDefault(name);
  const s = hkShortcuts.get(name);
  return typeof s === 'string' ? s : '';
}
function readShortcuts(){
  if(!chrome.commands?.getAll) return Promise.resolve();
  return chrome.commands.getAll().then(list => {
    hkShortcuts = new Map((Array.isArray(list) ? list : []).map(c => [c.name, typeof c.shortcut === 'string' ? c.shortcut : '']));
  }).catch(err => console.warn('[pxs] не удалось прочитать сочетания клавиш:', err));
}
/* тумблер «Горячие клавиши» (settings.hotkeys) — первой строкой вкладки,
   рисуется той же swRow; выключен → фон получает команду и ничего не делает */
const SET_KEYS = [
  { k:'hotkeys', ic:'kbd' },
];
function keysBlock(){
  return SET_KEYS.map(swRow).join('')
    + HK_CMDS.map(c => hkRow(c.ico, msg('hk' + c.k + 'T'), msg('hk' + c.k + 'D'), hkChord(c.name))).join('')
    + `<p class="set-note">${msg('kbNote')}<button class="kb-link" data-kbcopy title="${msg('copyAddr')}">${KB.ff ? msg('kbFf') : KB.url}</button></p>`;
}
function renderKeys(){ $('#setKeys').innerHTML = keysBlock(); }
/* вернулись на страницу (например, со страницы сочетаний браузера) при
   открытой вкладке клавиш — сочетания могли смениться, перечитываем */
function hkRefresh(){
  if(document.hidden || $('#v-settings').hidden || $('#sp-keys').hidden) return;
  readShortcuts().then(renderKeys);
}
document.addEventListener('visibilitychange', hkRefresh);
window.addEventListener('focus', hkRefresh);

function renderSettings(){
  hideTip();   /* 7К.2 (Д-1): перерисовка сносит носителя пузыря — пузырь не должен остаться */
  rstArmed = false; clearTimeout(rstTimer);
  /* этап 4: перерисовка приходит и по подписке — пока человек печатает
     домены, поле ввода не должно терять фокус и курсор (7Л: полей два —
     запоминаем, которое) */
  const af = document.activeElement;
  const keepDomains = af?.dataset?.lmfield ? { id: af.id, sel: [af.selectionStart, af.selectionEnd] } : null;
  $('#setConn').innerHTML = SET_CONN.map(swRow).join('') + typeRow();
  $('#setUi').innerHTML = SET_UI.map(swRow).join('');
  $('#setSite').innerHTML = siteRows();   /* 7Ж */
  renderKeys();   /* 7Д: тумблер «Горячие клавиши», три команды манифеста с сочетаниями от браузера, ссылка-кнопка на страницу сочетаний */
  renderLists();   /* 7Л: раздел «Списки» — своя функция, её зовёт и селектор режима */
  /* Счёт живой: считаем по тому же ключу ip:порт, что и
     «уже добавлен» на вкладке. Числа в макете (12 из 22) были
     примером — здесь они всегда сходятся с тем, что видно
     в списке, иначе блок начнёт врать при первом же добавлении */
  const accTotal = accountProxies.length;
  const accAdded = accountProxies.filter(inList).length;
  const accNew   = accTotal - accAdded;
  pruneWatch();   /* 7З: адреса, пропавшие и из списка, и из аккаунта, — вон из notifWatch */
  /* 7З: перерисовка приходит и по подписке (эхо своей записи notifWatch) —
     открытый список прокси и фокус на его строке должны пережить её */
  const ddOpen = $('#setAcc .ns-dd-btn')?.getAttribute('aria-expanded') === 'true';
  const ddFocus = af?.dataset?.nsrow;
  $('#setAcc').innerHTML = `
    <div class="opt">
      <span class="opt-i">${I.key}</span>
      <div class="opt-t">
        <h3>${msg('apiKey')}</h3>
        <p class="mono">${apiLinked() ? esc(maskKey(settings.apiKey)) : msg('apiNone')}</p>
        ${apiLinked() && account && account.error ? `<p class="acc-st fresh">${msg(account.error === 'empty' ? 'accKeyEmpty' : 'accKeyDead')}</p>` : ''}
        ${apiLinked() ? `<p class="acc-st">${msg('accAdded', [String(accAdded), String(accTotal)])}</p>` : ''}
        ${apiLinked() && accNew ? `<p class="acc-st fresh">${msg('accFresh', [String(accNew)])}</p>` : ''}
        ${apiLinked() ? `<p class="set-sub">${msg('accUnlinkNote')}</p>` : ''}
      </div>
      <span class="opt-end">
        ${apiLinked() ? `<button class="btn-ft" data-accshow>${msg('accShow')}</button>` : ''}
        <button class="btn-ft" data-api>${apiLinked() ? msg('apiUnlink') : msg('apiLink')}</button>
      </span>
    </div>
    ${SET_ACC.map(o => swRow({ ...o, extra: apiLinked() ? `<button class="btn-ft" data-accrefresh>${msg('accRefresh')}</button>` : '' })).join('')}
    ${notifScopeRow()}
    <div class="opt">
      <span class="opt-i">${I.reset}</span>
      <div class="opt-t">
        <h3>${msg('resetT')}</h3>
        <p>${msg('resetD')}</p>
      </div>
      <button class="btn-ft danger" data-reset><span id="rstT">${msg('reset')}</span></button>
    </div>`;
  if(keepDomains){
    const area = document.getElementById(keepDomains.id);
    if(area){ area.focus(); try{ area.setSelectionRange(keepDomains.sel[0], keepDomains.sel[1]); }catch(err){} }
  }
  if(ddOpen){
    const b = $('#setAcc .ns-dd-btn');
    if(b && b.getAttribute('aria-disabled') !== 'true') nsDdShow(b);
    if(ddFocus) $(`#setAcc [data-nsrow="${ddFocus}"]`)?.focus();
  }
}

/* ── 7Л · РАЗДЕЛ «СПИСКИ» (решение человека 19.09, В4) ──
   Сверху селектор режима «Выкл · Чёрный · Белый» (по образцу data-lm,
   aria-pressed; тумблера «Использовать список» больше нет — режим и есть
   выключатель), под ним два независимых блока — чёрный и белый список, у
   каждого подпись смысла, своё поле (#lmBlack / #lmWhite), импорт и
   экспорт (blacklist.txt / whitelist.txt) и подсказка luMask. Блок
   действующего режима помечен рамкой и подписью «действует»; второй —
   обычный, не серый: он редактируем, просто не действует. Порядок внутри
   блока (правка человека 20.09): заголовок и метка → подпись смысла →
   подпись поля → поле → импорт и экспорт под полем → подсказка о масках;
   подпись luD под селектором — со значком ⓘ и воздухом. Автовключения
   режима при первом домене и опускания при опустевшем поле НЕТ (В10):
   режим меняет только селектор. Подписи кнопок селектора — полные и
   короткие (как у вкладок .tab-lg/.tab-sm): при 480 px в ряд помещаются
   только короткие, title держит полные.
   3Б.5: домены в <textarea> — через esc() (аудит, проход Б): закрывающий
   тег textarea в импортированном файле ломал панель, а знак & при
   перерисовке превращался в другой домен */
const LM_ICO_IMPORT = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9.8V2.2"/><path d="m4.8 5.4 3.2-3.2 3.2 3.2"/><path d="M2.8 13.2h10.4"/></svg>';
const LM_ICO_INFO = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4"/><path d="M8 4.9h.01"/></svg>';
const LM_ICO_EXPORT = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.2v7.6"/><path d="m4.8 6.6 3.2 3.2 3.2-3.2"/><path d="M2.8 13.2h10.4"/></svg>';
/* корзина «Очистить список» (правка человека 20.09, 5) — рисунок кнопки «Удалить всё» героя, 13px */
const LM_ICO_CLEAR = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.2h11"/><path d="M6.3 4.2V2.8h3.4v1.4"/><path d="m4.2 4.2.6 9.8h6.4l.6-9.8"/><path d="M6.6 7v4.3M9.4 7v4.3"/></svg>';
/* подписи режимов: полная и короткая */
const LM_LABEL = { off: ['luOff', 'luOff'], black: ['luBlack', 'luBlackShort'], white: ['luWhite', 'luWhiteShort'] };
/* непустых строк в поле списка — счёт для героя и диагностики (годность
   строк не проверяется: человек видит строки, а не правила) */
const listCount = text => String(text || '').split('\n').filter(x => x.trim()).length;
/* 7К.2 (Б-2): предел поля списка, знаков — из схемы (у обоих списков один),
   как LIST_MAX попапа; текст длиннее не пишется ни вводом, ни импортом.
   Атрибута maxlength у полей нет намеренно: браузер молча обрезал бы вставку
   посреди домена и записался бы обрубок. listOver — память окна: тост
   listFull показывается один раз, пока длина не вернётся в предел */
const LIST_MAX = SETTINGS.listBlack.max;
const listOver = {};
/* «Очистить список» (правка человека 20.09, 5) — двухшаговое подтверждение
   прямо в кнопке, как «Удалить всё» героя: первый щелчок взводит («Точно
   очистить?», 3,2 с), второй пишет пустое поле в хранилище сразу; режим
   не трогается (В10). Пустой список — кнопка погашена, щелчок ничего не делает */
const armedClear = {};
function disarmClear(m){
  clearTimeout(armedClear[m]); delete armedClear[m];
  const b = $(`#setLists [data-lmclear="${m}"]`);
  if(b){ b.classList.remove('armed'); b.querySelector('span').textContent = msg('luClear'); }
}
function clearList(m){
  const field = listField(m);
  if(!settings[field].trim()) return;
  if(!(m in armedClear)){
    const b = $(`#setLists [data-lmclear="${m}"]`);
    b.classList.add('armed'); b.querySelector('span').textContent = msg('luClearAsk');
    armedClear[m] = setTimeout(() => disarmClear(m), 3200);
    return;
  }
  disarmClear(m);
  flushDomains();   /* набранное — не потерять в заплатке, которая перекрыла бы пустое поле */
  writeSetting({ [field]: '' });
  const area = $(`#setLists [data-lmfield="${m}"]`); if(area){ area.value = ''; area.classList.remove('bad'); }
  $(`#setLists [data-lmexport="${m}"]`)?.setAttribute('aria-disabled', 'true');
  $(`#setLists [data-lmclear="${m}"]`)?.setAttribute('aria-disabled', 'true');
  renderHero();
  toast(msg('wiped'));
}
function listBox(m){
  const field = listField(m), id = m === 'black' ? 'lmBlack' : 'lmWhite', active = settings.listMode === m;
  return `
    <div class="list-box${active ? ' active' : ''}">
      <div class="lb-hd">
        <h3>${msg(m === 'black' ? 'luBlackT' : 'luWhiteT')}</h3>
        ${active ? `<span class="lb-act">${msg('luActive')}</span>` : ''}
      </div>
      <p class="lb-d">${msg(m === 'black' ? 'luBlackD' : 'luWhiteD')}</p>
      <label class="lbl lb-lbl" for="${id}">${msg('luDomains')}</label>
      <textarea class="finp area" id="${id}" data-lmfield="${m}" rows="5" spellcheck="false" placeholder="example.com&#10;*.google.com">${esc(settings[field])}</textarea>
      <div class="lb-act-row">
        <button class="led-btn" data-lmimport="${m}">${LM_ICO_IMPORT}${msg('luImport')}</button>
        <button class="led-btn" data-lmexport="${m}" aria-disabled="${!settings[field].trim()}">${LM_ICO_EXPORT}${msg('luExport')}</button>
        <input type="file" id="${id}File" data-lmfile="${m}" accept=".txt,text/plain" hidden>
        <button class="led-btn lb-clear" data-lmclear="${m}" aria-disabled="${!settings[field].trim()}">${LM_ICO_CLEAR}<span>${msg('luClear')}</span></button>
      </div>
      <p class="set-note lb-note">${msg('luMask')}</p>
    </div>`;
}
function renderLists(){
  for(const m of Object.keys(armedClear)) disarmClear(m);   /* перерисовка — взвод «Очистить?» снимается */
  $('#setLists').innerHTML = `
    <div class="opt">
      <span class="opt-i${settings.listMode !== 'off' ? ' ok' : ''}">${ICON_LIST}</span>
      <div class="opt-t">
        <h3>${msg('luMode')}</h3>
        <p>${msg('luModeD')}</p>
      </div>
      <div class="seg lm-seg" role="group" aria-label="${msg('luModeAria')}">
        ${LIST_MODES.map(m => `<button data-lm="${m}" aria-pressed="${settings.listMode === m}" title="${esc(msg(LM_LABEL[m][0]))}"><span class="lm-lg">${msg(LM_LABEL[m][0])}</span><span class="lm-sm">${msg(LM_LABEL[m][1])}</span></button>`).join('')}
      </div>
    </div>
    <p class="set-note lm-note">${LM_ICO_INFO}<span>${msg('luD')}</span></p>
    <div class="lists-two">${listBox('black')}${listBox('white')}</div>`;
}

/* импорт: строки файла вливаются в СВОЙ список без дублей (7Л: файл
   выбран кнопкой блока — data-lmfile говорит, в какой; режим при этом не
   меняется, В10). Строки берутся как есть — негодные и исключения «!host»
   попадают в поле, человек видит и правит сам, в диагностике они считаются
   «пропущено», при применении их отбрасывает listsFrom (ответ проверяющего
   чата 21.09, 7Е). 7Е: повтор отсеивается и внутри самого файла — раньше
   множество have строилось по полю один раз и одна строка дважды в файле
   попадала в поле дважды */
$('#v-settings').addEventListener('change', e => {
  const m = e.target.dataset?.lmfile;
  if(!m) return;
  const file = e.target.files[0]; e.target.value = '';
  if(!file) return;
  const field = listField(m);
  file.text().then(txt => {
    const have = new Set(settings[field].split('\n').map(x => x.trim().toLowerCase()).filter(Boolean));
    const fresh = x => { const k = x.toLowerCase(); if(have.has(k)) return false; have.add(k); return true; };
    const add = txt.split(/\r?\n/).map(x => x.trim()).filter(x => x && fresh(x));
    if(!add.length){ toast(msg('noNewDomains')); return; }
    const was = settings[field].trim();
    const next = (was ? settings[field].replace(/\s+$/, '') + '\n' : '') + add.join('\n');
    if(next.length > LIST_MAX){ toast(msg('listFull'), true); return; }   /* 7К.2 (Б-2): итог длиннее предела — не пишем, поле не трогаем */
    writeSetting({ [field]: next });   /* этап 4: сразу в хранилище, без задержки набора */
    const area = $(`#setLists [data-lmfield="${m}"]`); if(area) area.value = settings[field];
    area?.classList.remove('bad');
    $(`#setLists [data-lmexport="${m}"]`)?.setAttribute('aria-disabled', 'false');
    $(`#setLists [data-lmclear="${m}"]`)?.setAttribute('aria-disabled', 'false');
    renderHero();
    toast(msg('domainsAdded', [String(add.length)]));
  });
});

/* этап 4: домены пишутся в хранилище с задержкой — не на каждую букву;
   уход со страницы дописывает сразу. 7Л: правки копятся в одну заплатку —
   поля два, писать надо то, что менялось */
let domainsT = null;
let domainsPatch = {};
function flushDomains(){
  if(domainsT === null) return;
  clearTimeout(domainsT); domainsT = null;
  const patch = domainsPatch; domainsPatch = {};
  state.patchSettings(patch).catch(storageFail);
}
window.addEventListener('pagehide', flushDomains);
$('#v-settings').addEventListener('input', e => {
  const m = e.target.dataset?.lmfield;
  if(m){
    const field = listField(m);
    if(e.target.value.length > LIST_MAX){
      /* 7К.2 (Б-2): длиннее предела схемы — в хранилище не пишется, поле
         красное, тост один раз; отпустит, когда длина вернётся в предел */
      e.target.classList.add('bad');
      if(!listOver[m]){ listOver[m] = true; toast(msg('listFull'), true); }
      return;
    }
    listOver[m] = false;
    settings = { ...settings, [field]: e.target.value };
    domainsPatch[field] = e.target.value;
    /* 7Л (В10): режим от содержимого поля не зависит — ни автовключения по
       первому адресу, ни опускания при опустевшем поле; только селектор */
    clearTimeout(domainsT);
    domainsT = setTimeout(flushDomains, 400);
    e.target.classList.remove('bad');
    $(`#setLists [data-lmexport="${m}"]`)?.setAttribute('aria-disabled', String(!settings[field].trim()));
    $(`#setLists [data-lmclear="${m}"]`)?.setAttribute('aria-disabled', String(!settings[field].trim()));
    renderHero();
  }
});
$('#v-settings').addEventListener('click', e => {
  if(e.target.closest('[data-kbcopy]')){
    /* служебные страницы браузера нельзя открыть переходом со
       страницы — копируем адрес; в расширении тут chrome.tabs.create */
    copyText(KB.url, msg('addrCopied'));   /* 3Б.6: тот же блок буфера стоял здесь копией copyText */
    return;
  }
  const im = e.target.closest('[data-lmimport]');
  if(im){ $(`#setLists [data-lmfile="${im.dataset.lmimport}"]`)?.click(); return; }
  const cl = e.target.closest('[data-lmclear]');
  if(cl){ clearList(cl.dataset.lmclear); return; }
  const ex = e.target.closest('[data-lmexport]');
  if(ex){
    /* 7Л: экспорт СВОЕГО списка, имя файла — по списку, не по режиму */
    const m = ex.dataset.lmexport, txt = settings[listField(m)].trim();
    if(!txt){
      const area = $(`#setLists [data-lmfield="${m}"]`);
      area?.classList.add('bad'); area?.focus();
      toast(msg('addDomainsFirst'), true);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt + '\n'], { type:'text/plain' }));
    a.download = (m === 'black' ? 'blacklist' : 'whitelist') + '.txt';
    a.click(); URL.revokeObjectURL(a.href);
    toast(msg('listSaved'));
    return;
  }
  const lm = e.target.closest('[data-lm]');
  if(lm){
    /* 7Л: селектор пишет только режим — 'off' | 'black' | 'white'; списки
       не трогает (В2). Раздел перерисовывается: метка «действует» переходит
       к выбранному блоку; поля при этом без фокуса — щелчок был по кнопке */
    if(lm.dataset.lm === settings.listMode) return;
    flushDomains();   /* набранное в поле не потерять при перерисовке */
    writeSetting({ listMode: lm.dataset.lm });
    renderLists();
    renderHero();
    return;
  }
  /* 7З: селектор области уведомлений о сроках — пишет только notifScope;
     запертые положения (без ключа) не срабатывают; блок «Аккаунт»
     перерисовывается (счёт отмеченных), список «по ключу» — колокольчики
     показываются только при «Выбранных» */
  const ns = e.target.closest('[data-ns]');
  if(ns){
    if(ns.getAttribute('aria-disabled') === 'true' || ns.dataset.ns === settings.notifScope) return;
    const patch = { notifScope: ns.dataset.ns };
    /* первый переход к «Выбранным» при пустом notifWatch — отмечаются
       добавленные по ключу: те, о ком уведомляли до этого (решение сессии);
       непустой список человека не трогается */
    if(ns.dataset.ns === 'picked' && !settings.notifWatch.length) patch.notifWatch = nsEntries().filter(x => x.src === 'pxs').map(x => x.key).slice(0, NOTIF_WATCH_MAX);   /* 7К.2 (Б-5): не больше предела схемы */
    writeSetting(patch);
    renderSettings();
    return;
  }
  /* 7З (правка человека 22.09, 1): выпадающий список прокси — открыть/закрыть
     (при «Выкл» заперт); колокольчик строки — только при действующей области
     «Выбранные», запертые строки — disabled, клик до сюда не доходит */
  const dd = e.target.closest('[data-nsdd]');
  if(dd){
    if(dd.getAttribute('aria-disabled') === 'true') return;
    const wasOpen = !dd.nextElementSibling.hidden;
    closeMenus();
    if(!wasOpen) nsDdShow(dd);
    return;
  }
  const nsr = e.target.closest('[data-nsrow]');
  if(nsr){
    if(nsActive() === 'picked') toggleWatch(nsr.dataset.nsrow);
    return;
  }
  /* этап 6: «Обновить сейчас» — команда фону keyRefresh (решение человека
     10.09); пока ждём — кнопка выключена. Ответ: ok → тост с числом
     записей; отказ — те же тексты, что у загрузки по ключу; «фон не
     ответил» и «команда упала» — как отказ сети. Счёт «новых», метки «нет
     в аккаунте» и строка «ключ больше не действует» приходят подпиской */
  const refr = e.target.closest('[data-accrefresh]');
  if(refr){
    if(refr.disabled) return;
    refr.disabled = true;
    send({ cmd:'keyRefresh' }).then(r => {
      const b = $('[data-accrefresh]');
      if(b) b.disabled = false;
      if(r.ok) toast(msgN('accRefreshed', r.count || 0));
      else toast(msg(KEY_ERR_TEXT[r.error] || 'kErrNet'), true);   /* 7И: те же четыре текста, что у загрузки по ключу */
    });
    return;
  }
  const sw = e.target.closest('[data-set]');
  if(sw){
    const k = sw.dataset.set;
    if(k === 'webrtc'){
      /* 7А. Выключение — только настройка; разрешение не отзываем
         (человек снимет сам в chrome://extensions, если захочет).
         Включение — запрос разрешения ПРЯМО ЗДЕСЬ, до любого ожидания:
         окно браузера показывается только по действию человека, и
         ожидание перед запросом теряет этот жест. Разрешение уже есть —
         окна не будет, запрос ответит «дали» сразу. Дали → настройка в
         хранилище, тост; не дали → тумблер остаётся выключенным, под ним
         строка (webrtcDenied). Пока окно открыто, второй клик ждёт. */
      if(webrtcOn()){
        writeSetting({ webrtc:false });
        syncWebrtcRow();
        toast(msg('webrtcWarn'), true);
        return;
      }
      if(webrtcAsking) return;
      webrtcAsking = true;
      chrome.permissions.request(PRIVACY)
        .then(granted => {
          privacyOk = granted;
          webrtcDenied = !granted;
          if(granted){ writeSetting({ webrtc:true }); toast(msg('webrtcOk')); }
        })
        .catch(err => {
          /* запрос не удался (жест потерян или окно не показалось) —
             для человека это тот же отказ: строка «включите тумблер и
             подтвердите» зовёт нажать ещё раз */
          console.warn('[pxs] запрос разрешения privacy не удался:', err);
          webrtcDenied = true;
        })
        .then(() => { webrtcAsking = false; syncWebrtcRow(); });
      return;
    }
    writeSetting({ [k]: !settings[k] });   /* этап 4: в хранилище */
    /* переключаем на месте — DOM живёт, transition проигрывается */
    sw.setAttribute('aria-checked', settings[k]);
    if(k === 'mask' || k === 'verify') renderHero();   /* verify правит подпись пинга */
    if(k === 'siteRow') $('#setSite').innerHTML = siteRows();   /* 7Ж: подстройка гаснет и загорается вслед за главной */
    return;
  }
  if(e.target.closest('[data-accshow]')){ goKeyPick(); return; }
  if(e.target.closest('[data-api]')){
    if(apiLinked()){
      /* этап 4: отвязка стирает только ключ; прокси остаются (3.7).
         Этап 6: кеш аккаунта и будильник снимает фон по подписке; ответ
         идущей загрузки бросается — поколение поднято, экран «загрузка»
         возвращается к вводу */
      ++keyGen;
      if(keyState === 'load') setKeyState('input');
      writeSetting({ apiKey: '' }); renderSettings();
      toast(msg('keyUnlinked'));
    } else {
      goKeyMode();
    }
    return;
  }
  const rst = e.target.closest('[data-reset]');
  if(rst){
    if(!rstArmed){
      rstArmed = true;
      $('#rstT').textContent = msg('resetAsk');
      rst.classList.add('armed');
      clearTimeout(rstTimer);
      rstTimer = setTimeout(() => {
        rstArmed = false; rst.classList.remove('armed');
        const t = $('#rstT'); if(t) t.textContent = msg('reset');
      }, 3200);
      return;
    }
    /* этап 4: сбрасываются «параметры выше» — тумблеры этого раздела, как
       обещает подпись; ключ, тема и списки доменов остаются. Этап 6:
       тумблер autoUpdate стоит выше кнопки — сбрасывается тоже (решение
       сессии). 7Г: тумблер badge снят — семь тумблеров. 7Ж: блок «Проксирование
       по сайтам» тоже выше кнопки — siteRow и siteTrack сбрасываются
       (девять), подстройка перерисовывается вслед за главной. 7Д: тумблер
       «Горячие клавиши» на своей вкладке — десятый, тоже возвращается во
       включённое (перерисовка ниже по всем .sw раздела). 7З: область
       уведомлений о сроках и отмеченные адреса сброс не трогает (решение
       человека 22.09) */
    const { webrtc, verify, failover, reload, restore, mask, autoUpdate, siteRow, siteTrack, hotkeys } = state.DEFAULT_SETTINGS;
    writeSetting({ webrtc, verify, failover, reload, restore, mask, autoUpdate, siteRow, siteTrack, hotkeys });
    $('#setSite').innerHTML = siteRows();
    $$('#v-settings .sw').forEach(s =>
      s.setAttribute('aria-checked', s.dataset.set === 'webrtc' ? webrtcOn() : settings[s.dataset.set]));
    /* 7А: отказ браузера — не настройка, но и держать мёртвую строку
       незачем (как в прототипе); окно запроса сброс не показывает — это
       не тот жест. Без разрешения тумблер остаётся выключенным со строкой */
    webrtcDenied = false;
    syncWebrtcRow();
    rstArmed = false; clearTimeout(rstTimer);
    rst.classList.remove('armed');
    $('#rstT').textContent = msg('reset');
    renderHero();
    toast(msg('resetDone'));
  }
});

/* настройки, отложенные подпиской: собираются в момент показа (2.5.1) */
function goView(v){
  $$('#nav button').forEach(x => x.removeAttribute('aria-current'));
  $('#nav [data-go="' + v + '"]').setAttribute('aria-current', 'page');
  ['proxy','settings','help'].forEach(x => $('#v-' + x).hidden = (x !== v));
  window.scrollTo({top:0});
  if(v === 'settings' && settingsDirty){ settingsDirty = false; renderSettings(); }
}

/* «Привязать» ведёт в добавление по ключу */
function goKeyMode(){
  goView('proxy');
  setListTab('add');
  $('#segMode [data-amode="key"]')?.click();
  setKeyState('input');
  $('#fKey')?.focus();
}

/* «Показать прокси из аккаунта»: ключ уже есть, спрашивать его
   заново незачем — открываем сразу экран выбора */
function goKeyPick(){
  goView('proxy');
  setListTab('add');
  $('#segMode [data-amode="key"]')?.click();
  if(!keyPicked.size)
    keyPicked = new Set(accountProxies.map((a, i) => i).filter(i => !inList(accountProxies[i])));
  setKeyState('pick');
}

/* ── ПРОВЕРКА АКТИВНОГО ПРОКСИ ──────────────────────────────
   ЗАМОРОЖЕНО (7Е: приведено к 7В). Заглушка прототипа: отклик того
   адреса, через который сейчас идёт трафик, — числом 24 и отказом только
   по сроку. Входа сюда нет: мостик «Проверить активный прокси» снят из
   помощи на 7В (решение человека 11.09, В3-а), массовой проверки не будет.
   Настоящая проверка при подключении — probe.js в фоне (пять запросов,
   при белом списке три; 'auth'/'dead' по однозначным кодам, тишина на всех
   — 'dead'), её итог окна показывают по state, отклик — в диагностике. */
function checkActive(){
  const p = active();
  if(!p){ toast(msg('needProxyFirst'), true); return; }
  if(checking.has(p.id)) return;
  checking.add(p.id);
  renderConn(); renderList();
  setTimeout(() => {
    checking.delete(p.id);
    /* 3Б.3: в прототипе случайный отказ в 12 % через failKind и случайное
       число 24…134; здесь отказ только по сроку, число — нижняя граница
       разброса, заглушка до probe.js (7В, не подключено — решение 29.08) */
    pings[p.id] = isExpired(p) ? 'exp' : 24;
    onCheckResult(p.id);
    renderConn(); renderList(); renderHero();
    const v = pings[p.id];
    /* Числа на экране нет: проверка отвечает на вопрос «жив или
       нет», а не «быстро или медленно». Слово то же самое, что в
       колонке состояния, — человек не должен сверять два разных
       показания одного и того же. Число остаётся в диагностике. */
    toast(typeof v === 'number' ? msg('respOk')
        : v === 'exp' ? msg('errExp')
        : v === 'auth' ? msg('wrongCreds') : msg('respDead'),
      typeof v !== 'number');
  }, 800);   /* 3Б.3: без случайной добавки к задержке */
}

/* Адрес страницы расширений зависит от браузера — как и адрес
   переназначения клавиш. Переходом его не открыть: браузер
   запрещает ссылки на служебные страницы, поэтому копируем */
const INCOG = (() => {
  const ua = navigator.userAgent;
  if(/Firefox/i.test(ua))   return 'about:addons';
  if(/YaBrowser/i.test(ua)) return 'browser://extensions/';
  if(/OPR\//.test(ua))      return 'opera://extensions';
  if(/Edg\//.test(ua))      return 'edge://extensions/';
  return 'chrome://extensions/';
})();
/* 7Д: адрес карточки расширения — с ?id= страница расширений браузера
   открывается сразу на карточке, где живёт «Разрешить в режиме инкогнито»
   (ответ проверяющего чата 21.09: кнопка «Скопировать адрес» остаётся
   всегда, копирует этот адрес; в Firefox параметра нет — ветка мёртвая,
   не 7Д) */
const INCOG_PAGE = INCOG.startsWith('about:') ? INCOG : INCOG + '?id=' + chrome.runtime.id;
/* 7Д (7.8, мастер-промт 3.10): разрешено ли расширение в инкогнито —
   один вызов у браузера при старте страницы (readIncognito; null — ещё не
   узнали или API нет). Постоянное состояние, не
   событие: в попапе ничего; здесь — строка диагностики и, при запрете,
   бейдж «сейчас запрещено» справа от заголовка карточки помощи про
   инкогнито и предупреждение в ней (факт этапа 2: в окне инкогнито при
   запрете виден настоящий адрес). Разрешено — карточка как была, кнопка
   адреса на месте. */
let incognitoOk = null;
function readIncognito(){
  let asked;
  try{ asked = chrome.extension.isAllowedIncognitoAccess(); }
  catch(err){ return Promise.resolve(); }   /* API нет (стенд, чужой браузер) — остаёмся при null */
  return Promise.resolve(asked)
    .then(v => { incognitoOk = v === true; })
    .catch(err => console.warn('[pxs] не удалось узнать доступ в инкогнито:', err));
}
function renderIncognito(){
  const off = incognitoOk === false;
  const pin = $('#incogPin'), warn = $('#hIncogWarn');
  if(pin) pin.hidden = !off;
  if(warn) warn.hidden = !off;
}

/* 7В: строка «Последний отклик» — результат проверки при подключении
   (решение 29.08: только сюда, на экран не выводится). Пишет фон в
   state.lastProbeAt (мс, момент записи) и state.lastProbeMs (отклик; 0 —
   не прошла) после включения или переключения из окна, после
   переключения при обрыве и при старте браузера; 0/0 — «не измерялся»
   (белый список, ещё не проверяли). Тумблер выключен — «проверка
   отключена», что бы ни лежало в state: без проверки строка описывала бы
   чужое подключение. Дата — та же локаль, что у строки «Дата».
   Пятая выдача: при state.probeSiteDown (ответили только чужие адреса
   проверки связи — прокси жив, а proxys.io через него не виден) —
   отдельная строка diagSiteUnreachable следом; при зелёном герое это не
   поломка: обновление аккаунта и ключ через такой прокси не пройдут */
function probeLine(){
  const D = k => msg('diag' + cap(k));
  if(!settings.verify) return D('probeOff');
  if(!(st.lastProbeAt > 0)) return D('notMeasured');
  const when = ' (' + new Date(st.lastProbeAt).toLocaleString(DATE_LOCALE) + ')';
  return (st.lastProbeMs > 0 ? msg('diagProbeMs', [String(st.lastProbeMs)]) : D('probeFail')) + when;
}
function siteLine(){
  return (settings.verify && st.lastProbeAt > 0 && st.probeSiteDown === true) ? [msg('diagSiteUnreachable')] : [];
}

/* 7Л: действующий список для диагностики — режим, строк, годных, пропущено */
function diagListsLine(){
  const D = k => msg('diag' + cap(k));
  const f = listField(settings.listMode);
  if(!f) return D('listsOff');
  const parsed = normalizeDomains(settings[f]);
  return (settings.listMode === 'black' ? D('black') : D('white')) + ' (' + listCount(settings[f]) +
    ', ' + D('valid') + ' ' + (parsed.domains.length + parsed.exceptions.length) + ', ' + D('skipped') + ' ' + parsed.skipped + ')';
}

/* Диагностика: всё, что нужно поддержке, и ничего, чего ей знать
   не положено. Логины, пароли и ключ API сюда не попадают —
   в обращение их вставляют по ошибке чаще всего.
   7Е (ответы проверяющего чата 21.09): добавлены строка levelOfControl
   (сырое значение из state — так его читает поддержка), тумблеры mask,
   siteRow, siteTrack, hotkeys (все десять), последняя ошибка (сырой код
   state.lastError) и до пяти последних событий фона из notifs.events —
   только вид и время, без адресов; события читаются один раз в момент
   сборки через state.readAll() (страница на notifs не подписана), поэтому
   функция асинхронная. badgeCount и адреса запросов не выводятся */
async function diagText(){
  /* 3Б.3: вложенный словарь diag.* уплощён в diagHead … diagNo; с
     ключами интерфейса не сводится (решение 07.09). D — доступ по
     хвосту имени: D('head') → msg('diagHead') */
  const p = active(), D = k => msg('diag' + cap(k));
  const yn = v => v ? D('yes') : D('no');
  let events = [], remote = null;
  try{ const all = await state.readAll(); events = (all.notifs && Array.isArray(all.notifs.events)) ? all.notifs.events : []; remote = all.remote; }
  catch(err){ console.warn('[pxs] диагностика: события фона не прочитались:', err); }
  const last = events.slice(-5);
  /* 7И (п. 8): «Файл сообщений: N, домен X, получен дата» при кеше; «нет» —
     забора ещё не было; «отказ» — кеша нет, последний забор отказал. Домен —
     тот, что действует для ссылок (site файла либо основной); адресов нет */
  const remoteLine = remote && remote.at > 0
    ? msg('diagRemoteGot', [String(remote.banners.length), siteHost(), new Date(remote.at).toLocaleString(DATE_LOCALE)])
    : remote && remote.error ? D('remoteFail') : D('remoteNone');
  /* этап 8: «Перенос данных прошлой версии: выполнен <дата>» по state.migratedAt
     (пишет только перенос, одной операцией с данными); поля нет — ключи прошлой
     версии в хранилище есть → «данные найдены, перенос не выполнен» (хранилище
     'legacy', расширение работает как до переноса), нет → «не требовался»
     (чистая установка). Старые ключи не читаются — только их наличие */
  let migrateLine;
  if(typeof st.migratedAt === 'number') migrateLine = msg('diagMigrateDone', [new Date(st.migratedAt).toLocaleString(DATE_LOCALE)]);
  else{
    let legacy = false;
    try{ legacy = await storage.hasLegacyData(); }
    catch(err){ console.warn('[pxs] диагностика: ключи прошлой версии не прочитались:', err); }
    migrateLine = legacy ? D('migrateFail') : D('migrateNone');
  }
  return [
    D('head'),
    D('date') + ': ' + new Date().toLocaleString(DATE_LOCALE),   /* 3Б.3: язык браузера вместо lang; 3Б.6: DATE_LOCALE */
    D('browser') + ': ' + navigator.userAgent,   /* браузер и система — одной строкой, как отдаёт браузер */
    D('ver') + ': ' + chrome.runtime.getManifest().version,   /* 3Б.3: из манифеста, а не константой «2.4» (хвост 3Б.0) */
    D('incognito') + ': ' + (incognitoOk === null ? '?' : yn(incognitoOk)),   /* 7Д: «Разрешено в инкогнито: да/нет»; «?» — страница не узнала (без API, стенд) */
    '',
    D('inList') + ': ' + proxies.length +
      ' (' + D('byKey') + ' ' + proxies.filter(x => x.src === 'pxs').length +
      ', ' + D('byHand') + ' ' + proxies.filter(x => x.src !== 'pxs').length + ')',
    D('key') + ': ' + (apiLinked() ? D('linked') : D('unlinked')),
    D('migrate') + ': ' + migrateLine,   /* этап 8 */
    D('remote') + ': ' + remoteLine,   /* 7И */
    D('conn') + ': ' + (st.enabled ? D('on') : D('off')),
    msg('diagControl') + ': ' + (typeof st.levelOfControl === 'string' ? st.levelOfControl : '?'),   /* 7Е: levelOfControl из state (пишет фон); «?» — ещё не записан. Ключ назван прямо, не через D(): его ищут поиском по файлу */
    D('act') + ': ' + (p ? p.type + ', ' + (p.src === 'pxs' ? D('fromAcc') : D('added')) +
      (p.gone ? ', ' + D('gone') : '') + ', ' + D('country') + ' ' + (p.cc || D('noCountry')) : D('none')),
    D('last') + ': ' + probeLine(),   /* 7В: из state, не из замороженного pings */
    ...siteLine(),                      /* 7В: строка про недоступный через прокси proxys.io — только когда это так */
    '',
    D('webrtc') + ': ' + yn(settings.webrtc) + (webrtcDeny() ? ' (' + D('denied') + ')' : ''),   /* 7А: пометка прототипа; «да (браузер не дал разрешение)» — включена, а разрешения нет */
    D('verify') + ': ' + yn(settings.verify),
    D('autoUpdate') + ': ' + yn(settings.autoUpdate),   /* этап 6 */
    D('failover') + ': ' + yn(settings.failover),
    D('reload') + ': ' + yn(settings.reload),
    D('restore') + ': ' + yn(settings.restore),
    D('mask') + ': ' + yn(settings.mask),           /* 7Е: остальные четыре тумблера */
    D('siteRow') + ': ' + yn(settings.siteRow),
    D('siteTrack') + ': ' + yn(settings.siteTrack),
    D('hotkeys') + ': ' + yn(settings.hotkeys),
    /* 7Л: «списки: чёрный (N, годных K, пропущено P) / белый (…) / выключены;
       в чёрном N, в белом M» — N и M считают непустые строки поля, K и P —
       normalizeDomains действующего списка (правила и исключения / не
       разобранные строки) */
    D('lists') + ': ' + diagListsLine() +
      '; ' + D('inBlack') + ' ' + listCount(settings.listBlack) + ', ' + D('inWhite') + ' ' + listCount(settings.listWhite),
    '',
    /* 7Е: последняя ошибка — сырой код ('auth' / 'dead'), иначе «нет»; события
       фона — вид и время, до пяти последних (в хранилище они лежат по
       порядку записи, старые вытесняются) */
    D('lastError') + ': ' + (st.lastError ? String(st.lastError) : D('none')),
    D('events') + ': ' + (last.length ? '' : D('none')),
    ...last.map(e => '  ' + String(e.kind) + ' — ' + new Date(Number(e.at) || 0).toLocaleString(DATE_LOCALE)),
  ].join('\n');
}

/* копирование с тостом и без подсветки узла: помощь (адрес страницы
   расширений, диагностика), меню строки (адрес прокси), адрес страницы
   клавиш. С подсветкой .hit — copyVal (креды героя) и кнопки форматов в
   помощи, у них свой блок. 3Б.6: два места сведены сюда */
function copyText(txt, doneMsg){   /* 3Б.6: второй параметр назывался как импорт msg и затенял его */
  const done = () => toast(doneMsg);
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(txt).then(done, done);
  else done();
}

/* мостик к конкретной настройке: открываем раздел, поднимаем
   нужную вкладку и подсвечиваем строку — искать не приходится.
   Этап 4: сюда же приходит признак раздела из попапа (временная область
   хранилища, решение 08.09) — те же пять переходов, что обещали тосты:
   'settings' — раздел настроек; 'lists' — вкладка списков; 'add' —
   вкладка «Добавить»; 'acc' — экран выбора прокси из аккаунта;
   'proxy' с id — строка этого прокси в списке. Всё остальное — имя
   тумблера, как было */
function goSetting(k, id){
  if(k === 'settings'){ goView('settings'); setSettingsTab('base'); return; }
  if(k === 'lists'){ goView('settings'); setSettingsTab('lists'); return; }
  /* 2.1: строка типа — в «Основных настройках», а не в списках; отдельный
     признак раздела из попапа открывает ровно эту строку. */
  if(k === 'protocol'){ goView('settings'); setSettingsTab('base'); return; }
  if(k === 'add'){ goView('proxy'); setListTab('add'); return; }
  if(k === 'acc'){ goKeyPick(); return; }
  if(k === 'proxy'){
    goView('proxy'); setListTab('list');
    const i = visibleList().findIndex(x => x.id === id);
    if(i > -1){
      if(!showAll) page = Math.floor(i / PER_PAGE) + 1;
      renderList();
      const row = $(`.row[data-id="${id}"]`);
      /* 7З (решение человека 22.09): строка в кадре — и вспышка (.row.flash в
         options.css), как у строки настроек ниже: снять класс, reflow,
         поставить — повторный переход к той же строке мигает заново; снять
         по окончании (1,8 с анимации, 1,9 с — как у .opt.flash) */
      if(row){ row.scrollIntoView({ block:'center' }); row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); setTimeout(() => row.classList.remove('flash'), 1900); }
    }
    return;
  }
  goView('settings'); setSettingsTab('base');
  const row = $('#v-settings [data-set="' + k + '"]')?.closest('.opt');
  if(!row) return;
  row.classList.remove('flash'); void row.offsetWidth;
  row.classList.add('flash');
  setTimeout(() => row.classList.remove('flash'), 1900);
}
/* признак раздела, оставленный попапом: читаем один раз при старте и
   стираем, чтобы следующее открытие из chrome://extensions его не подхватило */
async function openSection(){
  let sec;
  try{
    sec = await storage.sessionGet(SESSION_KEYS.SECTION);
    if(sec !== undefined) await storage.sessionRemove(SESSION_KEYS.SECTION);
  }catch(err){ console.error('[pxs] не удалось прочитать признак раздела:', err); return; }
  if(sec && typeof sec === 'object' && typeof sec.go === 'string') goSetting(sec.go, sec.id);
}
/* решение 09.09: открытая вкладка страницы переиспользуется — попап только
   показывает её и оставляет признак раздела; узнаём об этом по подписке на
   временную область (стирание приходит с newValue undefined — не наш случай) */
storage.sessionSubscribe(ch => {
  const c = ch[SESSION_KEYS.SECTION];
  if(c && c.newValue !== undefined) openSection();
});

/* 2.1: «Проверить тип» — три входа: кнопка в строке «TCP-адрес», кнопка
   массовой проверки в разборе вставки (там же) и пункт меню строки списка.
   Строка настроек получает кнопку только при выключенном прокси: проверка
   требует, чтобы браузер не был занят рабочим прокси (typecheck.js сам
   откажет с 'enabled', но кнопку-обманку показывать незачем). */
$('#setConn')?.addEventListener('click', e => {
  const b = e.target.closest('[data-typecheck-conn]');
  if(b) checkActiveType();
});

/* мостики из помощи: справка не рассказывает — ведёт и делает */
$('#v-help').addEventListener('click', e => {
  const hd = e.target.closest('.hacc-hd');
  if(hd){
    const open = hd.closest('.hacc').classList.toggle('on');
    hd.setAttribute('aria-expanded', open);
    return;
  }
  const f = e.target.closest('.fmt button');
  if(f){
    const s = f.textContent;
    const done = () => {
      f.classList.add('hit');
      setTimeout(() => f.classList.remove('hit'), 900);
      toast(msg('formatCopied'));
    };
    if(navigator.clipboard?.writeText) navigator.clipboard.writeText(s).then(done, done);
    else done();
    return;
  }
  if(e.target.closest('#hKey') || e.target.closest('#hKey2')){ goKeyMode(); return; }
  if(e.target.closest('#hPaste')){
    goView('proxy'); setListTab('add');
    $('#segMode [data-amode="paste"]')?.click();
    $('#bulk')?.focus();
    return;
  }
  if(e.target.closest('#hIncog')){
    copyText(INCOG_PAGE, msg('addrCopied'));   /* 7Д: адрес карточки расширения (?id=), копируется, не открывается */
    return;
  }
  if(e.target.closest('#hDiag')){
    /* 7Е: текст собирается с чтением событий фона — обещание; буфер обмена
       пишется сразу по готовности, жест человека ещё в силе */
    diagText().then(txt => copyText(txt, msg('diagCopied')));
    return;
  }
  /* 7В: кнопки «Проверить активный прокси» в помощи больше нет (решение
     человека 11.09, В3-а) — checkActive остаётся замороженным без входа */
  if(e.target.closest('#hWebrtc')){ goSetting('webrtc'); return; }   /* этап 4: тот же мостик, что у остальных настроек, с переключением вкладки (кандидат 3Б.6) */
  if(e.target.closest('#hVerify')){ chrome.tabs.create({ url: siteUrl(msg('urlChecker')) }); return; }   /* этап 4: прокси-чекер proxys.io (был тост); 7И: путь из словаря, хост — из файла сообщений */
  if(e.target.closest('#hSupport')){ chrome.tabs.create({ url: siteUrl(msg('urlContacts')) }); return; }   /* 7Е: страница контактов proxys.io; до 7Е — тост «откроем чат поддержки», адрес не был выбран; 7И: siteUrl */
});

/* навигация и магазин */
$('#nav').addEventListener('click', e => {
  const b = e.target.closest('[data-go]'); if(!b) return;
  goView(b.dataset.go);   /* 3Б.6: те же четыре шага стояли здесь копией goView */
});
/* 2.2.1 (просьба человека 19.10): кнопка в шапке теперь «Update Now» и ведёт
   на GitHub автора — https://github.com/Akash-Debnath1. До 2.2.1 здесь была
   корзина proxys.io (urlCart, адрес из словаря); продление («Продлить» в меню
   строки, в чипе истёкшего и в герое) по-прежнему ведёт в кабинет (urlMy) и
   этой правкой не затрагивается. */
const AUTHOR_GITHUB = 'https://github.com/Akash-Debnath1';
$('#btnBuy').addEventListener('click', () => chrome.tabs.create({ url: AUTHOR_GITHUB }));
function goRenew(){ chrome.tabs.create({ url: siteUrl(msg('urlMy')) }); }

/* флаги чекеров разводим по местам один раз на старте: класс на
   body правит вёрстку, атрибуты — видимость точек входа.
   Помощь из этой развязки вышла: массовой проверки не будет, а
   мостик «Проверить активный прокси» снят на 7В (решение человека
   11.09) — из помощи входа в чекер больше нет, только прокси-чекер
   на сайте */
document.body.classList.toggle('no-chk', !CHECKERS.hero);
$('#btnCheckAll').hidden = !CHECKERS.all;

applyStatic();
/* этап 4: подписка раньше чтения — изменение между ними не потеряется.
   Своё эхо и правки из попапа приходят одним путём: попап и страница
   открыты вместе → изменение в одном видно в другом. Совпавшее с копией
   не перерисовываем: второй прогон только сбивал бы фокус и переходы */
/* Что из state меняет вид героя и строк: включённость, кто активен, ошибка
   и пометка «идёт проверка». Остальные поля (lastProbe*, tz*, badgeCount,
   levelOfControl) рисуются своими местами или не рисуются в окне вовсе. */
function viewKey(s){
  return `${s.enabled}|${s.activeProxyId}|${s.lastError}|${s.probing}`;
}

/* ── ДЕКОРАЦИИ, КОТОРЫХ НЕ ВИДНО (2.5.1) ───────────────────────
   Кабель и лампы в герое живут вечными циклами. Пока герой уехал за
   экран (человек листает список) или вкладка в фоне, это чистая работа
   композитора: на слабой машине прокрутка списка шла в 12 кадров вместо
   60. Правило CSS — html.hero-away / html.tab-hidden в options.css. */
quietGlass();   /* 2.5.1: во время прокрутки стекло без blur — кадры возвращаются */

(function decorateOnlyWhenSeen(){
  const hero = $('#hero');
  if(hero && 'IntersectionObserver' in window){
    new IntersectionObserver(([en]) => {
      document.documentElement.classList.toggle('hero-away', !en.isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('tab-hidden', document.hidden);
  });
  document.documentElement.classList.toggle('tab-hidden', document.hidden);
  /* телефон/ноутбук с батареей: человек с «уменьшить движение» видит
     статичный герой — это правило в CSS, здесь только класс на случай
     системной настройки, пришедшей после загрузки */
  const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setRM = () => document.documentElement.classList.toggle('rm', rm.matches);
  setRM();
  if(rm.addEventListener) rm.addEventListener('change', setRM);
})();

state.subscribe(ch => {
  if(ch.proxies && !same(ch.proxies, proxies)){
    proxies = ch.proxies;
    if(editId !== null && !proxies.some(p => p.id === editId)){ editId = null; editDraft = null; }
    renderList(); renderHero();
    /* 2.5.1: настройки видны не всегда, а их перерисовка — самая большая
       часть работы (счёт «добавлено N из M», строка протокола). Пока
       вкладка скрыта, только помечаем; соберём при переходе */
    if($('#v-settings').hidden) settingsDirty = true;
    else renderSettings();
    if(keyState === 'pick') renderKeyPick();
  }
  if(ch.settings && !same(ch.settings, settings)){
    const wasTheme = settings.theme;
    settings = ch.settings;
    renderSettings(); renderHero();
    if(settings.theme !== wasTheme) applyTheme(settings.theme);
    checkPrivacy();   /* 7А: настройка могла измениться из-за разрешения (фон пишет webrtc: false при отзыве) */
  }
  if(ch.state && !same(ch.state, st)){
    const prevErr = st.enabled ? st.lastError : null;
    const wasProbing = probing();   /* 7В */
    const prevId = st.activeProxyId;
    const prevTz = `${st.tzZone}|${st.tzStatus}|${st.enabled}`;
    const prevEnabled = st.enabled;
    /* 2.5.1: герой и список зависят не от всего state. Результат проверки
       (lastProbe*), пояс, badgeCount пишутся часто — каждое включение даёт
       несколько записей подряд, — и каждая перерисовывала строки и герой
       целиком. Сравниваем только то, что на них влияет */
    const prevView = viewKey(st);
    applyState(ch.state);
    /* 2.2: строка состояния под тумблером пояса — только она, без
       перерисовки всех настроек: пояс меняется и на включении, и после
       ответа геосервиса, а тумблеры в это время живут своей жизнью */
    if(`${st.tzZone}|${st.tzStatus}|${st.enabled}` !== prevTz) syncTzRow();
    if(prevEnabled !== st.enabled) syncTypeRow();   /* 2.1: включили/выключили — запор на кнопке проверки типа */
    /* 7В (В2-а): прокси сменился, пока ждали тост про обрыв (deadT), ошибки
       нет, тумблер переключения включён — это переключение фона: картинка
       расстыковки и тост «Обрыв — переключились на …». Смена из соседнего
       окна приходит без 'dead' перед ней и остаётся без анимации */
    const switched = deadT !== null && settings.failover && st.enabled && !st.lastError && st.activeProxyId !== prevId;
    if(switched){
      clearTimeout(deadT); deadT = null;
      const p = active();
      holdSwitch(p ? msg('lostSwitched', [p.ip]) : null);
    }
    if(viewKey(st) !== prevView){ renderList(); renderHero(); }
    noteLastError(prevErr);
    if(wasProbing && !probing()) probeDone();   /* 7В */
  }
  /* этап 6: кеш аккаунта пишет фон — после загрузки по ключу, по
     будильнику, при отвязке (тогда приходит null — проверка по ключу, не
     по истинности) */
  if('account' in ch && !same(ch.account, account)){
    account = ch.account;
    accountProxies = (account && account.items) || [];
    keyPicked = new Set(accountProxies.map((a, i) => i).filter(i => !inList(accountProxies[i])));
    if(keyState === 'pick') renderKeyPick();
    renderSettings();
  }
  /* 7И: кеш файла сообщений — только хост ссылок (null — кеша нет, проверка
     по ключу); строка диагностики читает кеш сама при сборке */
  if('remote' in ch) setSiteHost(ch.remote ? ch.remote.site : '');
});
/* 7А (решение человека 10.09, В1-а): страница слушает разрешение сама.
   Ушло — тот же флаг «отказано», что после «Запретить»: строка под
   тумблером показывается сразу, не дожидаясь записи фона (фон при этом
   пишет webrtc: false, и по подписке тумблер выключится). Пришло —
   флаг снимается. Слушатели на верхнем уровне, синхронно */
chrome.permissions.onRemoved.addListener(p => {
  if(!(p && Array.isArray(p.permissions) && p.permissions.includes('privacy'))) return;
  privacyOk = false; webrtcDenied = true;
  syncWebrtcRow();
});
chrome.permissions.onAdded.addListener(p => {
  if(!(p && Array.isArray(p.permissions) && p.permissions.includes('privacy'))) return;
  privacyOk = true; webrtcDenied = false;
  syncWebrtcRow();
});
/* 7А: разрешение читается вместе с хранилищем — первая отрисовка
   тумблера WebRTC уже знает, есть ли оно; не узнали — null, тумблер
   рисуется по настройке. 7Д: тем же заходом — сочетания клавиш у браузера
   (readShortcuts) и доступ в инкогнито (readIncognito); оба своих ошибок
   наружу не отдают */
Promise.all([
  state.readAll(),
  chrome.permissions.contains(PRIVACY).catch(err => { console.warn('[pxs] не удалось проверить разрешение privacy:', err); return null; }),
  readShortcuts(),
  readIncognito(),
]).then(([all, has]) => {
  privacyOk = has;
  proxies = all.proxies;
  settings = all.settings;
  account = all.account;   /* этап 6 */
  accountProxies = (account && account.items) || [];
  setSiteHost(all.remote ? all.remote.site : '');   /* 7И: хост ссылок из кеша файла сообщений */
  applyState(all.state);
  applyTheme(settings.theme);   /* из chrome://extensions страница открывается без параметра адреса — один тёмный кадр принят (решение 08.09) */
  page = Math.floor(visibleList().findIndex(p => p.id === activeProxyId) / PER_PAGE) + 1 || 1;
  renderList(); renderHero(); renderSettings();
  renderIncognito();   /* 7Д */
  if(!proxies.length) setListTab('add');
  noteLastError(null, true);
  return openSection();
}).catch(err => {
  console.error('[pxs] страница не смогла прочитать хранилище:', err);
  toast(msg('errStorage'), true);
});

/* 3Б.3: стенд (makeProxies, standMark, resetList, scn с его сценариями
   key/list/row/set/cq и обработчик #stand) не перенесён — леса прототипа,
   в расширении состояния показывает сам браузер. С ним ушёл единственный
   потребитель ключа pickProxyFirst (сценарий cq); сам ключ снят из
   словарей на 7К.2 (уборка). */

/* стартовое состояние вкладки «По ключу» */
setKeyState('input');
