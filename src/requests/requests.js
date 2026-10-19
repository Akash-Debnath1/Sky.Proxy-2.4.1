/* src/requests/requests.js — страница «Запросы адреса» (7Л, шаг 3).
   Список последних запросов вкладки — по одному адресу (?host=), по сайту
   (?site= — все хосты с siteOf(host) === site) или по всей вкладке (без
   host и site). Данные — запись pageHosts[tab] временной области: у каждого
   адреса (hosts[host]) поле reqs пишет фон при мониторинге запросов
   (settings.siteTrack) и квоте ≥ PAGE_REQS.MIN_QUOTA; запись —
   { p, t, s, v, at } (мастер-промт 3.5; см. noteReq в service-worker.js);
   с этапа 9 (правка человека 29.09) p — полный адрес запроса (схема, хост,
   путь, параметры; без фрагмента; длиннее PAGE_REQS.MAX_LEN — обрезан с «…»).
   Страница читает ключ сама
   (storage.sessionGet) и перерисовывается по подписке (sessionSubscribe) —
   команды фону нет, как у попапа. Тексты — chrome.i18n через msg();
   адреса — через esc(). Тема: первый кадр — параметр ?theme=light
   (theme.js), дальше settings.theme по подписке, как у страницы настроек.
   Итог запроса (s): число — код HTTP (≥ 500 — сбой), строка — код ошибки
   браузера: PAGE_BLOCKED_ERRORS — «заблокирован» (серым, не сбой),
   PAGE_OK_ERRORS / ERR_CACHE_* — адрес ответил (не сбой), остальное — сбой.
   Та же классификация, что в applyReq фона. Порядок строк — по времени,
   старые сверху (как в журнале).
   Колонка «Путь» (этап 9): адрес — кнопка .pth одной строкой с многоточием;
   щелчок (Enter / Space — это кнопка) раскрывает строку (tr.open,
   aria-expanded) — адрес переносится целиком, второй щелчок сворачивает;
   раскрытые строки помнятся между перерисовками по подписке (Set ключей
   «at|host|p», render() ставит класс open по нему). Справа кнопка .cp —
   копирование адреса в буфер (navigator.clipboard.writeText, идиома copyVal
   страницы настроек; разрешения clipboardWrite не нужно — щелчок в странице
   расширения): класс hit на ячейке 900 мс и «Скопировано» в живой области
   #live (role=status, визуально скрыта), очищается через 1500 мс; обрезанный
   адрес копируется как хранится (с «…»). Один слушатель на #rows — строки
   перерисовывает render(); обработчиков в разметке нет (CSP). */
import { msg, uiLang } from '../shared/i18n.js';
import { $, esc } from '../shared/dom.js';
import * as storage from '../shared/storage.js';
import * as state from '../shared/state.js';
import { SESSION_KEYS, PAGE_BLOCKED_ERRORS, PAGE_OK_ERRORS, PAGE_OK_ERROR_PREFIX } from '../shared/constants.js';
import { siteOf } from '../shared/parse.js';

const params = new URLSearchParams(location.search);
const tabId = /^\d+$/.test(params.get('tab') || '') ? Number(params.get('tab')) : -1;
const host = (params.get('host') || '').trim().toLowerCase();
const site = host ? '' : (params.get('site') || '').trim().toLowerCase();
const mode = host ? 'host' : site ? 'site' : 'all';

let settings = null;
let rec = null;          /* запись вкладки из pageHosts или null */
let onlyErr = false;
let shown = [];          /* строки последней отрисовки — по data-i строки таблицы */
const opened = new Set();   /* этап 9: ключи раскрытых строк — переживают перерисовку */
const keyOf = x => `${x.at}|${x.h}|${x.p}`;

/* этап 9: значок «две страницы» кнопки копирования — копия ic-cp страницы
   настроек (кнопки форматов), как INFO_I в попапе */
const COPY_I = '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.6" y="5.6" width="8" height="8" rx="1.8"/><path d="M10.4 5.6V3.8c0-.8-.6-1.4-1.4-1.4H3.8c-.8 0-1.4.6-1.4 1.4v5.2c0 .8.6 1.4 1.4 1.4h1.8"/></svg>';

/* сбой ли запрос — по итогу s (число или строка) */
function isFail(r){
  if(typeof r === 'number') return r >= 500;
  if(typeof r !== 'string' || !r) return false;
  if(PAGE_BLOCKED_ERRORS.includes(r)) return false;
  if(PAGE_OK_ERRORS.includes(r) || r.startsWith(PAGE_OK_ERROR_PREFIX)) return false;
  return true;
}
const isBlocked = r => typeof r === 'string' && PAGE_BLOCKED_ERRORS.includes(r);

/* запросы вкладки под выбранный режим — из адресов записи, по времени */
function rows(){
  const hosts = rec && rec.hosts && typeof rec.hosts === 'object' ? rec.hosts : {};
  const out = [];
  for(const h of Object.keys(hosts)){
    if(mode === 'host' ? h !== host : mode === 'site' ? siteOf(h) !== site : false) continue;
    const list = hosts[h] && Array.isArray(hosts[h].reqs) ? hosts[h].reqs : [];
    for(const x of list) if(x && typeof x === 'object') out.push({ h, ...x });
  }
  return out.sort((a, b) => (a.at || 0) - (b.at || 0));
}

const timeFmt = new Intl.DateTimeFormat(uiLang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
function timeOf(t){
  if(typeof t !== 'number') return '';
  const d = new Date(t);
  return timeFmt.format(d) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}
function resultOf(r){   /* r — поле s записи */
  if(typeof r === 'number') return { text: String(r), cls: r >= 500 ? 'bad' : '' };
  if(isBlocked(r)) return { text: msg('rqBlocked'), cls: 'blk' };
  if(typeof r === 'string' && r) return { text: r, cls: isFail(r) ? 'bad' : '' };
  return { text: '—', cls: '' };
}
function routeOf(v){
  if(v === true) return { text: msg('rqVia'), cls: 'on' };
  if(v === false) return { text: msg('rqDirect'), cls: '' };
  return { text: '—', cls: '' };
}

function applyStatic(){
  const title = mode === 'host' ? msg('rqTitleHost', [host]) : mode === 'site' ? msg('rqTitleSite', [site]) : msg('rqTitleTab');
  document.title = title;
  $('#title').textContent = title;
  $('#tab').textContent = tabId >= 0 ? msg('rqTab', [String(tabId)]) : msg('rqNoTab');
  $('#all').textContent = msg('rqAllTab');
  const narrow = mode !== 'all';            /* ссылка «все адреса» — когда показан не весь список */
  $('#all').hidden = !narrow; $('#allSep').hidden = !narrow;
  $('#onlyErrT').textContent = msg('rqOnlyErr');
  $('#onlyErr').setAttribute('aria-label', msg('rqOnlyErr'));
  $('#cTime').textContent = msg('rqColTime');
  $('#cType').textContent = msg('rqColType');
  $('#cHost').textContent = msg('rqColHost');
  $('#cPath').textContent = msg('rqColPath');
  $('#cRes').textContent = msg('rqColResult');
  $('#cRoute').textContent = msg('rqColRoute');
  /* один адрес — колонка «Адрес» не нужна: её col и ячейки не рисуются (таблица
     с фиксированной раскладкой считает ширины по col, скрывать ячейки нельзя) */
  if(mode === 'host'){ $('#cHost').remove(); $('#tbl col.w-h').remove(); }
}

function render(){
  const list = rows();
  const fails = list.filter(x => isFail(x.s)).length;
  const via = list.filter(x => x.v === true).length;
  shown = onlyErr ? list.filter(x => isFail(x.s)) : list;
  const empty = $('#empty'), wrap = $('.tbl-w');
  let none = '';
  if(tabId < 0) none = msg('rqNoTab');
  else if(settings && settings.siteTrack !== true) none = msg('rqNoTrack');
  else if(!list.length) none = msg('rqNone');
  else if(!shown.length) none = msg('rqNoneErr');
  $('#sum').textContent = list.length ? msg('rqSummary', [String(list.length), String(fails), String(via)]) : '';
  empty.textContent = none;
  empty.hidden = !none;
  wrap.hidden = !!none;
  const showFull = esc(msg('rqShowFull')), copyT = esc(msg('rqCopy'));
  $('#rows').innerHTML = shown.map((x, i) => {
    const r = resultOf(x.s), v = routeOf(x.v);
    const open = opened.has(keyOf(x));
    const cls = [isFail(x.s) ? 'bad' : '', open ? 'open' : ''].filter(Boolean).join(' ');
    return `<tr data-i="${i}"${cls ? ` class="${cls}"` : ''}>
      <td class="t">${esc(timeOf(x.at))}</td>
      <td class="ty">${esc(x.t || '')}</td>
      ${mode === 'host' ? '' : `<td class="h">${esc(x.h)}</td>`}
      <td class="p"><div class="pw"><button type="button" class="pth" aria-expanded="${open ? 'true' : 'false'}" title="${showFull}">${esc(x.p || '')}</button><button type="button" class="cp" aria-label="${copyT}" title="${copyT}">${COPY_I}</button></div></td>
      <td class="r${r.cls ? ' ' + r.cls : ''}" title="${esc(r.text)}">${esc(r.text)}</td>
      <td class="v${v.cls ? ' ' + v.cls : ''}">${esc(v.text)}</td>
    </tr>`;
  }).join('');
}

/* этап 9: раскрытие строки и копирование адреса — один слушатель на #rows */
let liveTimer = null;
function copyAddr(td, text){
  const done = () => {
    td.classList.add('hit');
    setTimeout(() => td.classList.remove('hit'), 900);
    const live = $('#live');
    live.textContent = msg('copied');
    if(liveTimer) clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { live.textContent = ''; liveTimer = null; }, 1500);
  };
  if(navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done);
  else done();
}
$('#rows').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const tr = btn.closest('tr');
  const x = tr && shown[Number(tr.dataset.i)];
  if(!x) return;
  if(btn.classList.contains('pth')){
    const k = keyOf(x), open = !opened.has(k);
    if(open) opened.add(k); else opened.delete(k);
    tr.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  } else if(btn.classList.contains('cp')){
    copyAddr(btn.closest('td'), x.p || '');
  }
});

function applyTheme(theme){
  if(theme === 'light') document.documentElement.dataset.theme = 'light';
  else delete document.documentElement.dataset.theme;
}

async function load(){
  try{
    const all = await storage.sessionGet(SESSION_KEYS.PAGE_HOSTS);
    rec = all && typeof all === 'object' && tabId >= 0 && all[tabId] ? all[tabId] : null;
  }catch(err){
    console.error('[pxs] страница запросов: не удалось прочитать учёт:', err);
    rec = null;
  }
  render();
}

$('#onlyErr').addEventListener('click', () => {
  onlyErr = !onlyErr;
  $('#onlyErr').setAttribute('aria-checked', String(onlyErr));
  render();
});
/* «все адреса этой вкладки» — та же страница без host и site (тема остаётся) */
$('#all').addEventListener('click', () => {
  const p = new URLSearchParams({ tab: String(tabId) });
  if(document.documentElement.dataset.theme === 'light') p.set('theme', 'light');
  location.search = '?' + p.toString();
});

/* ── старт ── */
applyStatic();
/* подписки раньше чтения — изменение между ними не потеряется (как у окон) */
/* 7К.2 (Г-2): перечитывать только при смене записи СВОЕЙ вкладки — записи
   чужих вкладок страницу не перерисовывают */
storage.sessionSubscribe(ch => {
  const c = ch[SESSION_KEYS.PAGE_HOSTS];
  if(!c) return;
  const all = c.newValue && typeof c.newValue === 'object' ? c.newValue : null;
  const mine = all && tabId >= 0 && all[tabId] ? all[tabId] : null;
  if(JSON.stringify(mine) === JSON.stringify(rec)) return;
  load();
});
state.subscribe(ch => {
  if(ch.settings){
    const was = settings;
    settings = ch.settings;
    if(!was || settings.theme !== was.theme) applyTheme(settings.theme);
    render();
  }
});
state.getSettings().then(s => { settings = s; applyTheme(s.theme); return load(); }).catch(err => {
  console.error('[pxs] страница запросов: не удалось прочитать настройки:', err);
  load();
});
