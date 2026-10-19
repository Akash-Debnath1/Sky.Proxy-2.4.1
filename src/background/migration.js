/**
 * Перенос данных прошлой версии расширения (1.4.7.11) в нашу форму — этап 8.
 *
 * САМОЕ ОПАСНОЕ МЕСТО ПРОЕКТА: обновление приходит ~50 000 человек само, и
 * ошибка здесь стирает или прячет их прокси. Отсюда правила файла:
 *  - ключи прошлой версии (LEGACY_KEYS: proxySetting, mainProxiesList,
 *    apiProxiesList, ID, whiteList) НЕ ПИШУТСЯ И НЕ УДАЛЯЮТСЯ НИКОГДА —
 *    они и есть резервная копия; отдельного ключа с копией нет (восьмого
 *    ключа хранилища с копией паролей мастер-промт 3.5 не допускает);
 *    восстановление — снять четыре наших ключа и перезапустить (TESTPLAN,
 *    этап 8);
 *  - запись — ОДНА операция storage.setMany четырёх ключей: schemaVersion,
 *    proxies, settings, state (единственная в проекте запись ключей данных
 *    мимо state.js — атомарность важнее: воркер может уснуть между двумя
 *    записями). account, notifs, remote не создаются — их заведут фон и
 *    попап по ходу работы;
 *  - признак «переехал» один — schemaVersion (init() в storage.js даёт
 *    'legacy', пока версии нет, и 'ready' после неё); отдельного флага нет,
 *    state.migratedAt — только время переноса для диагностики;
 *  - при любой неудаче не пишется ничего: хранилище остаётся 'legacy',
 *    расширение работает как до переноса (auth.js читает креды из
 *    proxySetting запасным путём, список пуст), повтор — при следующем
 *    старте воркера сам собой (runPrepare в service-worker.js);
 *  - наш список proxies при отсутствии версии — не переезд, а испорченное
 *    хранилище: не пишется ничего ('ours'); наши settings/state без списка
 *    и версии (попутные записи окна и фона после неудачного переноса)
 *    переписываются планом заново (8.1, решение проверяющего чата 29.09);
 *  - в консоль — числа и коды, никогда адреса, логины, пароли;
 *  - хранилище страниц окна (до апреля 2024 данные прошлой версии лежали
 *    там) не читается и не трогается — мастер-промт 10.
 *
 * Триггер — исход 'legacy' подготовки хранилища при ЛЮБОМ старте воркера
 * (service-worker.js, runPrepare), а не событие onInstalled: событие
 * обновления можно и пропустить — воркер будит запрос через прокси.
 * Внутри одного обещания preparing два параллельных переноса невозможны.
 *
 * ОТКУДА ЧТО (по коду 1.4.7.11, разбор АНАЛИЗ_1.4.7.11_2026-09-29.md):
 *   mainProxiesList [{ http_host, http_port, proxy_rule?, auth: { enable, user, pass } }]
 *       → proxies: { id, ip, port, type: 'HTTP', login, pass, src: 'manual', tags: [] }
 *         (порт числом — у добавленных по ключу он число, у ручных строка;
 *         срока, страны, заказа нет — полей cc/exp/expUnlimited/orderId/gone
 *         НЕТ ВОВСЕ: «срока не знаем» = поля нет); кривая запись
 *         пропускается со счётом, перенос не останавливает (старые ключи
 *         целы, а отказ целиком оставил бы человека с пустым списком навсегда
 *         из-за одной строки — решение проверяющего чата 29.09);
 *         дубликаты по «ip:port» схлопываются (остаётся первая с логином);
 *   ID (индекс в mainProxiesList; число, строка из цифр, undefined, -1 или
 *       число вне границ) и proxySetting (последний применённый прокси)
 *       → state.activeProxyId (кандидат: по ID, иначе по адресу
 *         proxySetting, иначе '');
 *   proxySetting вне списка → отдельная запись в конец списка ТОЛЬКО если
 *       браузер прямо сейчас ходит через него (адрес применённой настройки
 *       совпал): им пользуются, терять нельзя; иначе не добавляется — по
 *       коду 1.4.7.11 «не в списке» это заглушка страницы настроек
 *       (1.1.1.1:8080) либо пустой адрес, а креды из proxySetting auth.js
 *       читает и так;
 *   whiteList (список ОБХОДА, свободный текст textarea через запятую и
 *       перевод строки) → settings.listBlack по строке и listMode 'black'
 *       при годном остатке, иначе 'off'; '<local>' и четыре сети
 *       SYSTEM_BYPASS_LIST выбрасываются; listWhite всегда пуст и режим
 *       'white' НЕ ПИШЕТСЯ НИКОГДА (в старой версии белого режима не было,
 *       а в нём прокси перестал бы работать везде, кроме перечисленного);
 *   enabled — ОТ БРАУЗЕРА (chrome.proxy.settings.get: наш уровень и адрес в
 *       настройке), не из старых ключей: «выключено» старой версии — наша
 *       настройка с режимом direct без адреса → enabled false; сверка при
 *       старте (reconcile) снимает эту настройку следом. levelOfControl не
 *       пишется — его пишет сверка;
 *   apiProxiesList — кеш выгрузки, не переносится и не читается по смыслу
 *       (читается в том же getMany только как имя ключа прошлой версии).
 *
 * Два экспорта: plan(dump, appliedAddr) — чистая функция без chrome.* (её
 * гоняет стенд m-migration на шести видах старых данных); migrate() —
 * читает, спрашивает браузер, зовёт plan, проверяет, пишет одной операцией;
 * никогда не бросает.
 *
 * chrome.* в файле — только chrome.proxy.settings.get в migrate(); await на
 * верхнем уровне нет; таймеров нет; серверных имён нет.
 */

import { KEYS, LEGACY_KEYS, LEGACY_KEYS_LIST, SCHEMA_VERSION, SRC, SYSTEM_BYPASS_LIST } from '../shared/constants.js';
import { hostPort, isValidAddr, normalizeDomains } from '../shared/parse.js';
import { check, PROXY, SETTINGS, STATE } from '../shared/schema.js';
import { DEFAULT_SETTINGS, DEFAULT_STATE, newProxyId } from '../shared/state.js';
import * as storage from '../shared/storage.js';
import { appliedAddr } from './proxy.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Порт из старой записи: строка ("5359") или число (по ключу) → parseInt, как делал старый код; вне 1..65535 или не число — null. */
function toPort(v) {
  if (typeof v !== 'string' && typeof v !== 'number') return null;
  const port = parseInt(v, 10);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : null;
}

/**
 * Одна запись прошлой версии ({ http_host, http_port, auth }) → запись в
 * нашей форме либо null, если запись кривая: не объект, адрес не по форме
 * (isValidAddr — та же проверка, что у окон и у сборки настройки; старая
 * проверка пропускала ведущие нули в октетах), порт вне границ, либо
 * запись не проходит схему PROXY (логин или пароль длиннее 255).
 * Логин и пароль — только строки (иное — пустые); при пустом логине пароль
 * пуст (прокси без авторизации).
 *
 * @param {*} item
 * @returns {Object|null}
 */
function toRecord(item) {
  if (!isObject(item)) return null;
  const ip = typeof item.http_host === 'string' ? item.http_host.trim() : '';
  const port = toPort(item.http_port);
  if (!isValidAddr(ip) || port === null) return null;
  const auth = isObject(item.auth) ? item.auth : {};
  const login = typeof auth.user === 'string' ? auth.user : '';
  const pass = login !== '' && typeof auth.pass === 'string' ? auth.pass : '';
  const rec = { id: newProxyId(), ip, port, type: 'HTTP', login, pass, src: SRC.MANUAL, tags: [] };
  return check(rec, PROXY).length === 0 ? rec : null;
}

/**
 * Адрес из старой записи (proxySetting либо элемент списка) в форме
 * hostPort — «ip:port» — либо '' при пустом или кривом адресе. Только адрес,
 * без кредов: для сопоставления с записями списка и с настройкой браузера.
 *
 * @param {*} item
 * @returns {string}
 */
function addrOf(item) {
  if (!isObject(item)) return '';
  const ip = typeof item.http_host === 'string' ? item.http_host.trim() : '';
  const port = toPort(item.http_port);
  return isValidAddr(ip) && port !== null ? hostPort({ ip, port }) : '';
}

/**
 * Индекс активного из старого ключа ID: число либо строка из цифр (попап
 * прошлой версии писал select.value строкой — "1") → целое; всё иное
 * (undefined, "abc", -1, дробь) → -1, кандидата нет.
 *
 * @param {*} v
 * @returns {number}
 */
function readIndex(v) {
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0 ? v : -1;
  if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
  return -1;
}

/**
 * Старый whiteList (список обхода) → строки для settings.listBlack: делится
 * по запятой И переводу строки (textarea старой версии), обрезается,
 * выбрасываются пустые, '<local>' и записи, равные элементам
 * SYSTEM_BYPASS_LIST (сравнение строк как есть — второго списка служебных
 * адресов не заводится). Остаток — как есть: что не разберётся,
 * normalizeDomains пропустит сам; CIDR не из четырёх системных станет
 * одиночным IPv4-правилом — известное ограничение. Длиннее предела схемы
 * (SETTINGS.listBlack.max, 4096) — строки отбрасываются с конца до предела,
 * число отброшенных — в итог.
 *
 * @param {*} whiteList
 * @returns {{listBlack: string, skippedList: number}}
 */
function bypassLines(whiteList) {
  const lines = (typeof whiteList === 'string' ? whiteList.split(/[\n,]/) : [])
    .map((s) => s.trim())
    .filter((s) => s !== '' && s !== '<local>' && !SYSTEM_BYPASS_LIST.includes(s));
  let skippedList = 0;
  while (lines.length > 0 && lines.join('\n').length > SETTINGS.listBlack.max) {
    lines.pop();
    skippedList += 1;
  }
  return { listBlack: lines.join('\n'), skippedList };
}

/**
 * План переноса — ЧИСТАЯ функция: ничего не читает, не пишет и к браузеру
 * не обращается. Правила 1.2–1.8 промта этапа 8 (29.09).
 *
 * @param {{proxySetting?: *, mainProxiesList?: *, ID?: *, whiteList?: *}} dump ключи прошлой версии как прочитаны, любые типы
 * @param {string} applied «host:port» прокси, применённого у браузера нашей настройкой (форма hostPort), либо '' — ничего нашего не применено
 * @returns {{proxies: Object[], settings: Object, state: Object, skipped: number, dupes: number, added: number, valid: number, skippedList: number, problems: string[]}}
 *   skipped — кривых записей списка пропущено; dupes — схлопнуто дубликатов «ip:port»;
 *   added — 0 | 1, запись из proxySetting добавлена в конец списка (применённый браузером прокси вне списка);
 *   valid — годных записей списка до схлопывания (proxies.length должно равняться valid − dupes + added);
 *   skippedList — строк whiteList отброшено ради предела listBlack; problems — проблемы схемы у proxies/settings/state (пусто — годно)
 */
export function plan(dump, applied) {
  const old = isObject(dump) ? dump : {};
  const appliedAt = typeof applied === 'string' ? applied : '';

  /* 1.2 — список: кривые записи пропускаются со счётом, порядок прежний */
  const rawList = Array.isArray(old[LEGACY_KEYS.MAIN_PROXIES_LIST]) ? old[LEGACY_KEYS.MAIN_PROXIES_LIST] : [];
  const byIndex = [];   // старый индекс → запись (null — пропущена)
  const converted = [];
  let skipped = 0;
  for (const item of rawList) {
    const rec = toRecord(item);
    byIndex.push(rec);
    if (rec === null) skipped += 1;
    else converted.push(rec);
  }
  const valid = converted.length;

  /* 1.3 — дубликаты по «ip:port» (hostPort — IPv6 в скобках у обеих сторон):
     остаётся первая запись с непустым логином, без логина у всех — первая;
     схлопнутая запись помнит, кто остался вместо неё (для кандидата 1.4) */
  const groups = new Map();
  for (const rec of converted) {
    const key = hostPort(rec);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rec);
  }
  const survivor = new Map();
  let dupes = 0;
  for (const list of groups.values()) {
    const kept = list.find((r) => r.login !== '') || list[0];
    for (const r of list) survivor.set(r, kept);
    dupes += list.length - 1;
  }
  const proxies = converted.filter((r) => survivor.get(r) === r);

  /* 1.4 — кандидат в активные: по ID (число либо строка из цифр, в границах,
     запись перенесена) → её оставшийся дубликат; иначе — запись с адресом
     proxySetting; иначе '' (пустая строка, не null — так ждёт схема STATE) */
  const setting = old[LEGACY_KEYS.PROXY_SETTING];
  const settingAddr = addrOf(setting);   // '' — пустой адрес либо адрес не по форме
  const idx = readIndex(old[LEGACY_KEYS.ID]);
  let activeProxyId = '';
  if (idx >= 0 && idx < byIndex.length && byIndex[idx] !== null) {
    activeProxyId = survivor.get(byIndex[idx]).id;
  } else if (settingAddr !== '') {
    const same = proxies.find((r) => hostPort(r) === settingAddr);
    if (same) activeProxyId = same.id;
  }

  /* 1.5 — прокси из proxySetting вне перенесённого списка: только тот, через
     который браузер ходит прямо сейчас (адрес применённой настройки совпал),
     и только если запись из него проходит схему (креды по форме); заглушка
     1.1.1.1:8080 отдельно не распознаётся — применили её, значит она и
     переносится, это правда о браузере */
  let added = 0;
  if (settingAddr !== '' && settingAddr === appliedAt && !proxies.some((r) => hostPort(r) === settingAddr)) {
    const settingRec = toRecord(setting);
    if (settingRec !== null) {
      proxies.push(settingRec);
      added = 1;
    }
  }

  /* 1.6 — настройки: умолчания (apiKey '' — старая версия ключ не хранила) плюс
     список обхода; 'white' невозможен по построению */
  const { listBlack, skippedList } = bypassLines(old[LEGACY_KEYS.WHITE_LIST]);
  const listMode = normalizeDomains(listBlack).domains.length > 0 ? 'black' : 'off';
  const settings = { ...DEFAULT_SETTINGS, listMode, listBlack, listWhite: '' };

  /* 1.7 — состояние: enabled от браузера; активный — запись с применённым
     адресом (в том числе добавленная по 1.5), иначе кандидат 1.4;
     levelOfControl не пишется — его запишет сверка при старте следом */
  let enabled = false;
  if (appliedAt !== '') {
    enabled = true;
    const current = proxies.find((r) => hostPort(r) === appliedAt);
    if (current) activeProxyId = current.id;
  }
  const state = { ...DEFAULT_STATE, enabled, activeProxyId, migratedAt: Date.now() };

  /* 1.8 — проверка формы перед записью (пропущенных в списке уже нет) */
  const problems = [
    ...proxies.flatMap((rec, i) => check(rec, PROXY, `proxies[${i}]`)),
    ...check(settings, SETTINGS, 'settings'),
    ...check(state, STATE, 'state'),
  ];

  return { proxies, settings, state, skipped, dupes, added, valid, skippedList, problems };
}

/**
 * Перенос: прочитать ключи прошлой версии и наши одним обращением, спросить
 * браузер, применён ли наш прокси, построить план, проверить и записать
 * четыре ключа одной операцией. Никогда не бросает.
 *
 * Итог { ok, count, skipped, dupes, added, enabled } при удаче; при неудаче
 * { ok: false, reason } — 'ours' (наш список прокси либо версия схемы уже
 * есть: это не переезд с 1.4.7.11, а испорченное хранилище — например,
 * профиль разработчика после чистки руками; не пишется ничего; наши
 * settings и/или state без списка и версии препятствием не считаются —
 * перезаписываются планом, строка console.warn без значений — 8.1),
 * 'check' (план не прошёл схему — ошибка нашего кода, problems — перечень
 * без секретов), 'count' (количества не сошлись — ошибка нашего кода),
 * 'error' (исключение — в консоль только его текст).
 *
 * @returns {Promise<{ok: boolean, count?: number, skipped?: number, dupes?: number, added?: number, enabled?: boolean, reason?: string, problems?: string[]}>}
 */
export async function migrate() {
  try {
    const box = await storage.getMany([...LEGACY_KEYS_LIST, KEYS.SCHEMA_VERSION, KEYS.PROXIES, KEYS.SETTINGS, KEYS.STATE]);

    /* 1.1 (8.1) — наш список прокси при отсутствии версии — не переезд, а
       испорченное хранилище (профиль разработчика после чистки руками):
       список пишут только окна 2.0.0, это данные человека, перезаписывать
       нельзя. settings и state без списка и версии — не препятствие: они
       появляются и без переезда — в окне между неудачным переносом и
       следующим стартом воркера (смена управления прокси пишет
       levelOfControl, отказ прокси по кредам из запасного пути — lastError,
       человек в окне — тему и тумблеры); план запишет их заново одной
       операцией с остальным (слияния нет — решение проверяющего чата 29.09). */
    if (KEYS.PROXIES in box) {
      console.warn('[pxs] перенос данных прошлой версии не выполнен: наши ключи уже есть при отсутствии версии схемы');
      return { ok: false, reason: 'ours' };
    }
    /* версия уже записана — хранилище размечено, переносить нечего (сюда
       воркер не приходит: init() дал бы 'ready'; защита от прямого вызова) */
    if (typeof box[KEYS.SCHEMA_VERSION] === 'number') {
      console.warn('[pxs] перенос данных прошлой версии не выполнен: версия схемы уже записана');
      return { ok: false, reason: 'ours' };
    }
    const stray = [KEYS.SETTINGS, KEYS.STATE].filter((key) => key in box);   // строка в консоль — после записи

    const dump = {};
    for (const key of LEGACY_KEYS_LIST) if (key in box) dump[key] = box[key];

    /* enabled — от браузера: единственное chrome.* в файле */
    const cfg = await chrome.proxy.settings.get({});
    const ours = !!cfg && cfg.levelOfControl === 'controlled_by_this_extension';
    const applied = ours ? appliedAddr(cfg.value) : '';

    const p = plan(dump, applied);

    if (p.problems.length > 0) {
      console.error(`[pxs] перенос данных прошлой версии не выполнен: план не прошёл проверку формы — ${p.problems.join('; ')}`);
      return { ok: false, reason: 'check', problems: p.problems };
    }
    if (p.proxies.length !== p.valid - p.dupes + p.added) {
      console.error(`[pxs] перенос данных прошлой версии не выполнен: количества не сошлись (${p.proxies.length} против ${p.valid} − ${p.dupes} + ${p.added})`);
      return { ok: false, reason: 'count' };
    }

    /* 1.9 — одна операция, версия вместе с данными; старые ключи не трогаются */
    await storage.setMany({
      [KEYS.SCHEMA_VERSION]: SCHEMA_VERSION,
      [KEYS.PROXIES]: p.proxies,
      [KEYS.SETTINGS]: p.settings,
      [KEYS.STATE]: p.state,
    });

    if (stray.length > 0) {
      console.warn(`[pxs] перенос данных прошлой версии: наши ключи ${stray.join('/')} без версии перезаписаны`);
    }
    const cut = p.skippedList > 0 ? `, строк списка отброшено ${p.skippedList}` : '';
    console.log(`[pxs] перенос данных прошлой версии: прокси ${p.proxies.length}, пропущено ${p.skipped}, дубликатов ${p.dupes}, из настройки браузера ${p.added}; списки: ${p.settings.listMode}${cut}; включено: ${p.state.enabled ? 'да' : 'нет'}`);
    return { ok: true, count: p.proxies.length, skipped: p.skipped, dupes: p.dupes, added: p.added, enabled: p.state.enabled };
  } catch (err) {
    console.error(`[pxs] перенос данных прошлой версии не выполнен: ошибка — ${err && err.message ? err.message : String(err)}`);
    return { ok: false, reason: 'error' };
  }
}
