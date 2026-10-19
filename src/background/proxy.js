/**
 * Включение и выключение прокси в браузере.
 *
 * Область настроек — только 'regular': обычные окна. Инкогнито живёт
 * отдельной областью: без разрешения «в инкогнито» прокси там не
 * применяется, и страница предупреждает об этом (7Д, бейдж и карточка
 * помощи по isAllowedIncognitoAccess).
 *
 * ДВА РЕЖИМА (этап 5). Без списков доменов — fixed_servers: один прокси на
 * всё плюс системный список обхода. Со списками — pac_script: браузер
 * получает скрипт из pac.js и сам решает по каждому адресу, идти через
 * прокси или напрямую. Режим выбирает applyProxy по settings при каждом
 * включении, переключении и повторном применении; окна про режим не знают
 * и знать не должны.
 *
 * ПРО СЛОВО bypassList В ЭТОМ ФАЙЛЕ. Так называется поле в настройках
 * САМОГО БРАУЗЕРА, другого имени у него нет. Домены человека лежат в
 * settings полями listBlack и listWhite, режим — listMode (с 7Л; прежнее
 * одно поле listDomains снято 7Л), а неизменяемый системный список —
 * SYSTEM_BYPASS_LIST в constants.js. Запрет из таблицы поиска касается
 * наших имён, не чужого API.
 */

import { SYSTEM_BYPASS_LIST, CHECK_HOSTS } from '../shared/constants.js';   // CHECK_HOSTS (7Ж): адреса проверки связи — через прокси и при белом списке
import { hostPort, isValidAddr } from '../shared/parse.js';
import { getProxies, getSettings, patchState } from '../shared/state.js';   // getProxies (7К.2, А-2): чья настройка осталась у браузера после отказа set
import { buildPac, listsFrom, readMarker } from './pac.js';   // readMarker (7К.2, А-2): адрес из маркера скрипта — appliedAddr переехала сюда из service-worker.js
import { chromeScheme, normType } from '../shared/proxytype.js';   // 2.1: тип записи → схема браузера и директива PAC

/**
 * Что означает каждое из четырёх значений «кто управляет настройками».
 *
 * not_controllable ШИРЕ, ЧЕМ КАЖЕТСЯ: это не только политика организации,
 * но и ключ запуска браузера, и более приоритетный источник настроек.
 * Различить их по значению нельзя, поэтому текст общий.
 */
const CONTROL_MESSAGES = Object.freeze({
  controlled_by_this_extension: 'Настройками прокси управляет это расширение.',
  controllable_by_this_extension: 'Настройки прокси свободны.',
  controlled_by_other_extensions: 'Настройками прокси управляет другое расширение. Выключите его и попробуйте снова.',
  not_controllable: 'Управление недоступно — политика организации или настройки запуска браузера.',
});

/** Значения, при которых включать прокси бессмысленно: браузер нас не послушает. */
const BLOCKING_LEVELS = Object.freeze(['controlled_by_other_extensions', 'not_controllable']);

/**
 * Что стоит у браузера: уровень управления и сама настройка.
 * Один вызов на применение — и уровень, и текущая настройка из одного ответа.
 * @returns {Promise<{level: string, value: Object|null}>}
 */
async function readSetting() {
  const res = await chrome.proxy.settings.get({});
  return {
    level: res && typeof res.levelOfControl === 'string' ? res.levelOfControl : 'not_controllable',
    value: res && res.value && typeof res.value === 'object' ? res.value : null,
  };
}

/** Кто сейчас управляет настройками прокси. */
async function levelOfControl() {
  return (await readSetting()).level;
}

/** Текст про уровень управления на человеческом языке. */
function controlMessage(level) {
  return CONTROL_MESSAGES[level] || `Неизвестное состояние управления: ${level}.`;
}

/**
 * Проверка адреса и порта — одна на оба режима, до выбора режима.
 *
 * Адрес, который браузер не примет (например, IPv4 с октетом больше 255),
 * не уходит в настройку — иначе «включено» с пустыми страницами и
 * ERR_NO_SUPPORTED_PROXIES (этап 4). Форма, не существование: жив ли
 * прокси, с 7В выясняет probe.js — проверка при подключении, — а обрыв
 * на настоящем трафике ловит фон (7Б); здесь про это ничего нет.
 *
 * @param {{ip: string, port: number|string}} proxy
 * @returns {{host: string, port: number}}
 */
function checkAddr(proxy) {
  const host = proxy && typeof proxy.ip === 'string' ? proxy.ip.trim() : '';
  if (!host) throw new Error('buildConfig: адрес прокси пустой');
  if (!isValidAddr(host)) throw new Error('buildConfig: адрес прокси не похож на IP или имя хоста');

  // Порт приходит то строкой из формы, то числом из хранилища.
  const port = parseInt(proxy.port, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`buildConfig: порт ${proxy.port} вне границ 1..65535`);
  }
  return { host, port };
}

/**
 * Собрать настройки для браузера.
 *
 * fixed_servers — как было: singleProxy плюс bypassList из SYSTEM_BYPASS_LIST
 * (массив уходит как есть, браузер ждёт именно массив).
 *
 * pac_script (этап 5) — скрипт из pac.js. mandatory ОБЯЗАТЕЛЬНО и ровно
 * один раз в проекте: без него браузер при невалидном скрипте молча
 * откатывается на прямое соединение, и настоящий IP уходит наружу
 * (решение 08.09). С ним битый скрипт ломает интернет — это хуже для
 * человека, но лучше утечки и ловится проверкой.
 *
 * Зовёт только applyProxy ниже.
 *
 * @param {{ip: string, port: number|string}} proxy
 * @param {'fixed_servers'|'pac_script'} [mode]
 * @param {null|{listMode: string, domains: string[], exceptions?: string[], skipped?: number}} [lists] — из listsFrom(), только для pac_script; exceptions — строки-исключения «!host» (7Ж, шаг 3)
 */
function buildConfig(proxy, mode = 'fixed_servers', lists = null) {
  const { host, port } = checkAddr(proxy);

  if (mode === 'fixed_servers') {
    return {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          // 2.1: схема — из типа записи (chromeScheme, строчными). Прежде
          // здесь стоял литерал 'http'; протокол записи теперь может быть
          // HTTP, HTTPS, SOCKS5 или SOCKS4.
          scheme: chromeScheme(proxy.type),
          host,
          port,
        },
        bypassList: SYSTEM_BYPASS_LIST,
      },
    };
  }

  if (mode === 'pac_script') {
    if (!lists || !Array.isArray(lists.domains) || lists.domains.length === 0) {
      throw new Error('buildConfig: для режима pac_script нужен непустой список доменов');
    }
    return {
      mode: 'pac_script',
      pacScript: {
        data: buildPac({ host, port, type: normType(proxy.type), listMode: lists.listMode, domains: lists.domains, exceptions: lists.exceptions, always: CHECK_HOSTS }),   // exceptions (7Ж, шаг 3); type — 2.1
        mandatory: true,
      },
    };
  }

  throw new Error(`buildConfig: неизвестный режим «${mode}»`);
}

/** Хост из ответа браузера: IPv6 он может вернуть в квадратных скобках. */
const noBrackets = (h) => (typeof h === 'string' ? h.replace(/^\[|\]$/g, '') : '');

/**
 * Адрес прокси, который применён у браузера: из singleProxy при
 * fixed_servers, из маркера первой строки скрипта при pac_script. Форма
 * — как у hostPort, одно сравнение на оба режима. Нет ни того, ни
 * другого — пустая строка. 7К.2 (А-2): переехала из service-worker.js —
 * читает и сверка при старте, и applyProxy после отказа set.
 *
 * @param {Object} value значение из chrome.proxy.settings.get
 * @returns {string}
 */
export function appliedAddr(value) {
  if (!value || typeof value !== 'object') return '';
  if (value.mode === 'pac_script') {
    const marker = readMarker(value.pacScript && value.pacScript.data);
    return marker ? marker.addr : '';
  }
  const rule = value.rules && value.rules.singleProxy;
  if (!rule || typeof rule.host !== 'string') return '';
  const port = parseInt(rule.port, 10);
  if (!Number.isInteger(port)) return '';
  // IPv6 браузер может вернуть в квадратных скобках — hostPort ставит их сам.
  return hostPort({ ip: noBrackets(rule.host), port });
}

/**
 * Стоит ли у браузера ровно та настройка, которую мы собрали: тот же режим
 * и тот же текст скрипта либо те же адрес и порт в singleProxy — и с 8.1 при
 * fixed_servers bypassList тоже: после обновления с 1.4.7.11 у браузера её
 * список обхода (с '<local>', снятым на 7Б, и строками whiteList как
 * набраны), и сверка при старте переставляет настройку один раз через
 * ifChanged. Списки — массивы строк поэлементно (та же длина, тот же
 * порядок, строки как есть — наш список фиксирован); поля нет — как пустой
 * массив. Сравнивать с прошлым значением в памяти воркера нельзя — сон её
 * стирает, поэтому сравнение идёт с тем, что стоит у браузера.
 *
 * @param {Object|null} browser значение из chrome.proxy.settings.get
 * @param {Object} ours из buildConfig
 */
function sameConfig(browser, ours) {
  if (!browser || !ours || browser.mode !== ours.mode) return false;
  if (ours.pacScript) {
    return !!browser.pacScript && browser.pacScript.data === ours.pacScript.data;
  }
  const have = browser.rules && browser.rules.singleProxy;
  const want = ours.rules.singleProxy;
  if (!have || noBrackets(have.host) !== want.host || parseInt(have.port, 10) !== want.port) return false;
  /* 2.1: протокол — часть настройки. Без этого сравнения смена типа у того
     же адреса считалась бы «уже такой», и браузер остался бы на прежней
     схеме, а окно сказало бы «включено». */
  if (String(have.scheme || 'http').toLowerCase() !== String(want.scheme || 'http').toLowerCase()) return false;
  return sameList(browser.rules.bypassList, ours.rules.bypassList);
}

/** Два списка обхода равны: массивы строк той же длины в том же порядке; поля нет — пустой массив. */
function sameList(a, b) {
  const x = Array.isArray(a) ? a : [];
  const y = Array.isArray(b) ? b : [];
  return x.length === y.length && x.every((s, i) => s === y[i]);
}

/*
 * Этап 4: своей функции записи состояния здесь больше нет — patchState
 * импортируется из state.js, единственной точки записи. Прежняя копия
 * читала и писала state целиком, и её правка могла потеряться под записью
 * из auth.js.
 */

/**
 * 7К.2 (А-2): после отказа set — запись списка, чья настройка осталась у
 * браузера: настройка наша (controlled_by_this_extension) и её адрес
 * (appliedAddr) совпадает с адресом записи. Иначе null: у браузера
 * ничего нашего нет (или чтение настройки упало — тогда тоже «выключено»).
 *
 * @returns {Promise<Object|null>}
 */
async function keptProxy() {
  try {
    const now = await readSetting();
    if (now.level !== 'controlled_by_this_extension') return null;
    const addr = appliedAddr(now.value);
    if (!addr) return null;
    return (await getProxies()).find((p) => p && typeof p.id === 'string' && hostPort(p) === addr) || null;
  } catch (err) {
    console.warn('[pxs] после отказа настройки не удалось перечитать настройку браузера:', err);
    return null;
  }
}

/**
 * Включить прокси.
 *
 * Режим выбирается здесь по settings через listsFrom(): null → fixed_servers,
 * иначе pac_script. Порядок «состояние → креды → set» не меняется.
 *
 * beforeSet — работа, которую надо доделать ПОСЛЕ записи состояния,
 * но ДО того, как браузер начнёт гнать трафик через прокси. Сюда фоновый
 * скрипт передаёт подготовку логина и пароля: иначе первый же запрос
 * успеет прийти в обработчик раньше, чем данные для входа окажутся
 * в памяти. Функция передаётся снаружи, чтобы этот файл ничего не знал
 * про соседний.
 *
 * opts.ifChanged — для повторного применения по подписке на settings
 * (этап 5): если у браузера уже ровно эта настройка, не делать ничего —
 * ни состояния, ни кредов, ни строки в консоль. Команды окон зовут без
 * него: включение и переключение применяют настройку всегда.
 *
 * Поле lists в opts (6.1, самолечение) — готовые списки вместо тех, что
 * собрались бы по settings: { listMode, domains, exceptions?, skipped } той
 * же формы, что отдаёт listsFrom(). Единственный потребитель — временная настройка
 * на время запроса к аккаунту; всё остальное режим по-прежнему берёт из
 * settings.
 *
 * opts.keepError (7Ж, находка человека 18.09) — не снимать причину
 * ошибки: повторное применение по подписке на settings и команда
 * siteReload меняют только списки, а не прокси. Прежде оно писало lastError: null, и
 * прокси, помеченный «не отвечает» (или «неверный логин»), после любой
 * правки списков показывался подключённым без проверки — списки
 * включились, а мёртвый прокси «ожил». Команды окон (включение,
 * переключение) по-прежнему снимают ошибку: это новая попытка
 * подключения, за ней идёт проверка 7В.
 *
 * Отклонённый set (7К.2, А-2): состояние — по правде, а не «выключено»
 * вслепую. Настройка у браузера перечитывается: если она наша
 * (controlled_by_this_extension) и её адрес совпадает с записью списка —
 * у браузера остался прежний прокси (отказ при переключении), пишем
 * «включено» с его идентификатором (lastError не трогаем); иначе — как
 * прежде, «выключено»: иначе состояние сказало бы «включено» при пустой
 * настройке браузера. Отказ возвращается в обоих случаях.
 *
 * @param {Object} proxy
 * @param {() => Promise<*>} [beforeSet]
 * @param {{ifChanged?: boolean, keepError?: boolean, lists?: {listMode: string, domains: string[], exceptions?: string[], skipped: number}}} [opts]
 * @returns {Promise<{ok: boolean, level: string, message: string, unchanged?: boolean}>}
 */
export async function applyProxy(proxy, beforeSet, opts) {
  const current = await readSetting();
  const level = current.level;

  if (BLOCKING_LEVELS.includes(level)) {
    await patchState({ levelOfControl: level });
    return { ok: false, level, message: controlMessage(level) };
  }

  const lists = (opts && opts.lists) || listsFrom(await getSettings());
  const mode = lists ? 'pac_script' : 'fixed_servers';

  let config;
  let addr;
  try {
    const checked = checkAddr(proxy);
    addr = hostPort({ ip: checked.host, port: checked.port });
    config = buildConfig(proxy, mode, lists);
  } catch (err) {
    return { ok: false, level, message: err.message };
  }

  if (opts && opts.ifChanged && sameConfig(current.value, config)) {
    return { ok: true, level, message: 'Настройка браузера уже такая.', unchanged: true };
  }

  const patch = {
    enabled: true,
    activeProxyId: typeof proxy.id === 'string' ? proxy.id : '',
    levelOfControl: level,
  };
  if (!(opts && opts.keepError)) patch.lastError = null;
  await patchState(patch);

  if (typeof beforeSet === 'function') {
    await beforeSet();
  }

  try {
    await chrome.proxy.settings.set({ value: config, scope: 'regular' });
  } catch (err) {
    const message = `Браузер не принял настройку прокси: ${err && err.message ? err.message : String(err)}`;
    console.error(`[pxs] ${message}`);
    // 7К.2 (А-2): что у браузера на самом деле — наша прежняя настройка или ничего.
    const kept = await keptProxy();
    if (kept) {
      await patchState({ enabled: true, activeProxyId: kept.id });
    } else {
      await patchState({ enabled: false, lastError: null });
    }
    return { ok: false, level, message };
  }

  const after = await levelOfControl();
  await patchState({ levelOfControl: after });

  const tail = lists
    ? `, списки: ${lists.listMode === 'white' ? 'белый' : 'чёрный'}, доменов ${lists.domains.length}, пропущено ${lists.skipped}`
    : ', без списков';
  console.log(`[pxs] прокси включён: ${addr}${tail}`);
  return { ok: true, level: after, message: `Прокси включён: ${addr}${tail}` };
}

/**
 * Выключить прокси и вернуть браузеру его собственные настройки.
 *
 * Причина ошибки снимается: висящая ошибка на выключенном прокси
 * ничего не значит и только пугает.
 *
 * activeProxyId НЕ трогаем (этап 4). Выбранный прокси и включённое
 * соединение — разные вещи: после выключения окна показывают тот же
 * адрес, готовый включиться снова. Код этапа 2 здесь стирал выбор, и
 * «выключил — выбор слетел» было бы ровно той жалобой на старую версию,
 * ради которой активный прокси задан идентификатором.
 */
export async function clearProxy() {
  await chrome.proxy.settings.clear({ scope: 'regular' });

  const level = await levelOfControl();
  await patchState({
    enabled: false,
    levelOfControl: level,
    lastError: null,
  });

  console.log('[pxs] прокси выключен');
  return { ok: true, level, message: 'Прокси выключен.' };
}

/*
 * Ошибки прокси (этап 5). Единственный способ увидеть ошибку самого
 * PAC-скрипта: до применения она не видна никак. По памяти, событие
 * сообщает и о недоступном прокси (ERR_PROXY_CONNECTION_FAILED), не только
 * о скрипте — поле details с номером строки отличает одно от другого.
 * На состояние пока не влияет (этап 7). Слушатель — на верхнем уровне,
 * синхронно.
 */
chrome.proxy.onProxyError.addListener((details) => {
  console.warn(`[pxs] ошибка прокси (onProxyError): fatal=${details.fatal}, error=${details.error}, details=${details.details}`);
});
