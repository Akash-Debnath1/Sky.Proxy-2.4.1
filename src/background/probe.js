/**
 * Проверка при подключении (7В, план 7.2; решение 29.08, пересмотры 11.09).
 *
 * Пять запросов через только что включённый прокси, параллельно: HEAD к
 * статике сайта на обоих хостах SITE_HOSTS (основной и зеркало) и GET к
 * трём чужим адресам проверки связи PROBE_HOSTS — тем, к которым сами
 * Windows, Firefox и iOS стучатся при каждом подключении к сети (пятая
 * выдача, решение человека 11.09 по находке на первом же аккаунте: живой
 * прокси, через который молчат и сайт, и зеркало, объявлялся мёртвым).
 * К статике сайта — потому что HEAD к странице запускает её генерацию, а
 * нужен только факт ответа и время до него.
 *
 * Вердикт:
 *  - ответил хоть один из пяти хоть чем-нибудь (любой код, любое тело —
 *    провайдерская заглушка тоже ответ) → прокси жив, «N мс» по первому
 *    ответу любого хоста;
 *  - ответили только чужие адреса, а оба хоста SITE_HOSTS молчат или
 *    отказали → прокси жив, но сайт из его страны не виден: siteDown —
 *    диагностика страницы печатает строку про недоступный proxys.io
 *    (обновление аккаунта и ключ через такой прокси не пройдут);
 *  - ни одного ответа, но хоть один запрос упал до предела (туннельная
 *    ошибка, сброс — так отвечает живой прокси) → жив, «не прошла»;
 *  - отказ соединения с самим прокси → 'dead' сразу — это ловит слушатель
 *    onErrorOccurred в service-worker.js: свой запрос он узнаёт по адресу
 *    и методу из PROBE_REQUESTS (isProbeRequest);
 *  - ТИШИНА НА ВСЕХ ПЯТИ — ни ответа, ни кода за наш предел
 *    PROBE_TIMEOUT_MS — → прокси не отвечает: silent: true, фон ставит
 *    'dead' и переключается при тумблере, как при обрыве.
 * Неверный пароль ставит 'auth' обработчик авторизации (auth.js) на этих
 * же запросах — здесь ничего добавлять не надо.
 *
 * Время — только в диагностику для поддержки (state.lastProbeAt,
 * state.lastProbeMs пишет service-worker.js). Индикатора качества в
 * интерфейсе нет и не будет: время ответа маленького файла через прокси
 * люди сравнивали бы с пингом VPN-клиента, а это разные вещи.
 *
 * Запросы идут по правилам текущего режима: без списков и при чёрном
 * списке — через прокси; при белом хосты сайта ушли бы напрямую, поэтому
 * с 7Ж (2′.1) проверка идёт только по трём чужим адресам, которые скрипт
 * PAC ведёт через прокси и в белом режиме (thirdOnly ниже; siteDown при
 * этом не измеряется). credentials 'omit'
 * относится к cookie сайта; авторизация прокси через onAuthRequired
 * работает как у любого запроса. Чужие адреса — обычный http: через
 * HTTP-прокси это прямой GET без туннеля.
 *
 * Без chrome.* и document: файл гоняется в Node. В консоль — ровно одна
 * строка, без адресов.
 */

import { PROBE_HOSTS, PROBE_TIMEOUT_MS, SITE_HOSTS } from '../shared/constants.js';

/** Запросы проверки: два хоста сайта (HEAD к статике) и три чужих адреса (GET). */
export const PROBE_REQUESTS = Object.freeze([
  ...SITE_HOSTS.map((host) => Object.freeze({ url: `https://${host}/favicon.ico`, method: 'HEAD', site: true })),
  ...PROBE_HOSTS.map((url) => Object.freeze({ url, method: 'GET', site: false })),
]);

/** Адреса запросов проверки — для стенда (v-probe); фон узнаёт свои запросы не отсюда, а по PROBE_REQUESTS (адрес и метод). */
export const PROBE_URLS = Object.freeze(PROBE_REQUESTS.map((r) => r.url));

/**
 * Одна проверка — пять запросов разом.
 *
 * Предел ожидания — AbortSignal.timeout(PROBE_TIMEOUT_MS), один на все
 * запросы. Второй повод прервать — сигнал cancel от фона: человек включил
 * другой прокси, пока запросы были в полёте, и их исход больше ни о чём не
 * говорит (а отказ соединения с прежним прокси, пришедший после смены, не
 * должен достаться новому). Один AbortController собирает оба повода:
 * AbortSignal.any в браузерах до 116 нет. Ответ хоста сайта прерывает
 * остальные запросы — вердикт уже есть; ответ чужого адреса — нет: хосты
 * сайта ещё могут ответить, и от этого зависит строка про недоступный
 * сайт.
 *
 * Исход по запросу: answered — любой ответ; error — упал до предела (код
 * — у слушателя onErrorOccurred фона); timeout — прерван нашим пределом
 * без ответа и без кода (тишина).
 *
 * В консоль — одна строка: «N мс» либо «не прошла» с причиной; отменённая
 * снаружи проверка строки не даёт вовсе.
 *
 * thirdOnly (7Ж, находка человека 18.09): при белом списке хосты сайта идут
 * по списку — напрямую, и их ответ о прокси ничего не сказал бы; проверка
 * идёт только по трём чужим адресам, которые скрипт PAC в белом режиме
 * ведёт через прокси (CHECK_HOSTS). siteDown тогда не измеряется — false.
 *
 * @param {AbortSignal} [cancel] отмена снаружи
 * @param {{thirdOnly?: boolean}} [opts]
 * @returns {Promise<{ok: true, ms: number, siteDown: boolean}|{ok: false, silent: boolean}>}
 *   siteDown — ответили только чужие адреса; silent — тишина на всех (только при ok: false)
 */
export async function probe(cancel, opts) {
  const thirdOnly = !!(opts && opts.thirdOnly);
  const started = Date.now();
  const ctrl = new AbortController();
  let timedOut = false;
  AbortSignal.timeout(PROBE_TIMEOUT_MS).addEventListener('abort', () => {
    timedOut = true;
    ctrl.abort();
  }, { once: true });
  const stop = () => ctrl.abort();
  if (cancel) {
    if (cancel.aborted) stop();
    else cancel.addEventListener('abort', stop, { once: true });
  }

  const one = async (req) => {
    try {
      await fetch(req.url, {
        method: req.method,
        cache: 'no-store',
        credentials: 'omit',
        signal: ctrl.signal,
      });
      const ms = Date.now() - started;
      if (req.site) ctrl.abort();   // сайт ответил — остальные запросы больше не нужны
      return { kind: 'answered', site: req.site, ms };
    } catch (err) {
      // Прервана нашим пределом без ответа — тишина; всё прочее (сеть, отказ
      // прокси, отмена обработчиком авторизации, отмена снаружи, отмена после
      // ответа сайта) — упало до предела.
      return { kind: timedOut ? 'timeout' : 'error', site: req.site };
    }
  };

  const results = await Promise.all((thirdOnly ? PROBE_REQUESTS.filter((r) => !r.site) : PROBE_REQUESTS).map(one));

  const answered = results.filter((r) => r.kind === 'answered').sort((a, b) => a.ms - b.ms);
  if (answered.length) {
    // Не меньше миллисекунды: ноль в хранилище означает «не прошла».
    const ms = Math.max(1, answered[0].ms);
    const siteDown = !thirdOnly && !answered.some((r) => r.site);
    console.log(`[pxs] проверка при подключении: ${ms} мс${siteDown ? '; сайт proxys.io через прокси не ответил' : ''}`);
    return { ok: true, ms, siteDown };
  }
  if (cancel && cancel.aborted) return { ok: false, silent: false };   // отмена снаружи — не отказ, строки нет
  const silent = results.every((r) => r.kind === 'timeout');
  console.log(`[pxs] проверка при подключении: не прошла — ${silent ? 'все хосты молчат' : 'прокси отвечает ошибками, ответа нет'}`);
  return { ok: false, silent };
}
