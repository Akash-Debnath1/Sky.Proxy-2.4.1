/**
 * Подстановка логина и пароля прокси.
 *
 * САМЫЙ ВАЖНЫЙ ФАЙЛ ПРОЕКТА. Именно здесь чинится баг, из-за которого
 * действующая версия показывает окно запроса пароля на каждом запросе.
 *
 * КАК БЫЛО СЛОМАНО. Слушатель вешался в режиме 'blocking' и возвращал
 * Promise. Этот режим требует вернуть готовый объект прямо сейчас,
 * а Promise браузер не разворачивает: он видит объект без данных для входа,
 * решает, что расширение не вмешивается, и спрашивает человека сам.
 *
 * КАК ТЕПЕРЬ. Режим 'asyncBlocking': браузер даёт вторым аргументом функцию
 * asyncCallback и ждёт её вызова столько, сколько нужно. Ответ уходит
 * ТОЛЬКО через неё, никогда через return.
 *
 * ЭТОТ ФАЙЛ НИ ОТ ЧЕГО НЕ ЗАВИСИТ, кроме общего слоя. Ошибка в proxy.js
 * не должна мешать загрузиться модулю, на котором держится золотой тест,
 * поэтому импортов из соседних файлов фоновой части здесь нет.
 * Этап 4: запись причины ошибки — setLastError — переехала в общий
 * state.js, единственную точку записи состояния; здесь она импортируется.
 * Порядок регистрации слушателей и ожидание готовности кредов не менялись.
 *
 * СЕКРЕТЫ НЕ ПЕЧАТАЮТСЯ. Ни логин, ни пароль не попадают в console
 * ни одной строкой — даже в сообщении об ошибке, даже длиной.
 */

import { KEYS, LEGACY_KEYS } from '../shared/constants.js';
import { setLastError } from '../shared/state.js';
import * as storage from '../shared/storage.js';

/** Сколько ждём готовность данных для входа, прежде чем сдаться. */
const READY_TIMEOUT_MS = 3000;

/**
 * Данные для входа, лежащие в памяти воркера: { login, pass } либо null.
 *
 * Переменная верхнего уровня здесь разрешена явно (мастер-промт 3.2):
 * она наполняется при старте воркера ДО первого использования, а сон
 * воркера переживать ей не нужно — после пробуждения она наполнится снова.
 */
let creds = null;

/**
 * Обещание готовности — то самое чтение при старте.
 *
 * ЗАЧЕМ ОНО ВООБЩЕ. Настройка прокси хранится в браузере и применяется
 * раньше, чем просыпается фоновый скрипт. Первый же запрос после запуска
 * Chrome приходит в обработчик, когда переменная выше ещё пуста. Если
 * просто прочитать переменную — там будет null, мы ответим «данных нет»,
 * и человек увидит ровно то окно, ради которого всё это писалось.
 * Поэтому обработчик ждёт обещание, а не читает переменную.
 */
let ready = null;

/**
 * Счётчик попыток по номеру запроса.
 *
 * Переменная верхнего уровня разрешена явно: номера запросов сон воркера
 * тоже не переживают, потерять карту вместе с ними безвредно.
 */
const attempts = new Map();

/** Признак, что данные для входа поменялись, — без самих данных. */
function fingerprint(value) {
  if (!value) return '';
  return `${value.login.length}:${value.login}\u0000${value.pass}`;
}

/**
 * Прочитать логин и пароль активного прокси.
 *
 * ДВА ИСТОЧНИКА, И ВТОРОЙ ВАЖЕН НЕ МЕНЬШЕ ПЕРВОГО.
 *
 * Основной — наш список прокси и номер активного в состоянии.
 *
 * Запасной — ключ прошлой версии расширения. Он не удаляется никогда.
 * Если перенос данных на этапе 8 провалится, прокси у человека останется
 * включённым (настройка живёт в браузере, а не у нас), а данные для входа
 * окажутся недоступны — и он получит окно на каждой странице. Запасной
 * путь закрывает ровно этот случай.
 *
 * ⚠️ ЗАПАСНОЙ ПУТЬ СРАБАТЫВАЕТ НА «ЗАПИСИ НЕТ», А НЕ НА «ЛОГИН ПУСТОЙ».
 * Прокси без авторизации — законное состояние: человек стёр пароль
 * осознанно. Если не различать отсутствие записи и пустое поле, старый
 * пароль из ключа прошлой версии тихо подставится обратно, и человек
 * получит подключение с данными, которые он только что убрал, — без
 * единой строки в консоли. Поэтому: НАШЛИ активный прокси в списке —
 * ответ окончательный, даже если он «авторизации нет». В старый ключ
 * заглядываем, только когда нашей записи нет вовсе.
 *
 * 7К.2 (А-1): вместе с логином и паролем отдаются адрес и порт той же
 * записи (ip, port) — по ним обработчик ниже сверяет, наш ли прокси
 * спросил пароль; у ключа прошлой версии это http_host / http_port.
 *
 * @returns {Promise<{login: string, pass: string, ip: string, port: number, from: string}|null>}
 */
async function readCreds() {
  const state = await storage.get(KEYS.STATE);
  const activeProxyId = state && typeof state.activeProxyId === 'string' ? state.activeProxyId : '';

  if (activeProxyId) {
    const list = await storage.get(KEYS.PROXIES);
    const found = Array.isArray(list)
      ? list.find((p) => p && p.id === activeProxyId)
      : null;

    if (found) {
      // Запись нашлась — она и есть ответ. Ниже мы уже не идём.
      if (typeof found.login === 'string' && found.login !== '') {
        return {
          login: found.login,
          pass: typeof found.pass === 'string' ? found.pass : '',
          ip: typeof found.ip === 'string' ? found.ip : '',
          port: parseInt(found.port, 10),
          from: 'список прокси',
        };
      }
      return null; // прокси без авторизации, и это осознанный выбор человека
    }
  }

  // Запасной путь. Только чтение: старые ключи не пишем и не удаляем.
  const legacy = await storage.get(LEGACY_KEYS.PROXY_SETTING);
  const auth = legacy && typeof legacy === 'object' ? legacy.auth : null;
  if (auth && typeof auth.user === 'string' && auth.user !== '') {
    return {
      login: auth.user,
      pass: typeof auth.pass === 'string' ? auth.pass : '',
      ip: typeof legacy.http_host === 'string' ? legacy.http_host : '',
      port: parseInt(legacy.http_port, 10),
      from: 'ключ прошлой версии',
    };
  }

  return null;
}

/**
 * Перечитать данные для входа и обновить обещание готовности.
 *
 * Вызывается при старте воркера, при изменении хранилища и вручную —
 * из фонового скрипта, перед тем как объявить прокси браузеру.
 *
 * Обещание НИКОГДА не отклоняется: отклонение здесь означало бы, что
 * обработчик не дождётся ответа и запрос повиснет.
 *
 * @returns {Promise<{login: string, pass: string, from: string}|null>}
 */
export function reloadCreds() {
  ready = readCreds()
    .then((value) => {
      creds = value;
      return value;
    })
    .catch((err) => {
      console.error('[pxs] не удалось прочитать данные для входа:', err);
      creds = null;
      return null;
    });
  return ready;
}

/*
 * 2.1: ВРЕМЕННЫЕ ДАННЫЕ ДЛЯ ПРОВЕРКИ ТИПА (typecheck.js).
 *
 * Проверка протокола поднимает пробную настройку прокси и стучится в
 * gstatic. Если у проверяемого прокси есть логин и пароль, браузер спросит
 * их — и без ответа показал бы человеку окно входа посреди проверки.
 * Поэтому typecheck кладёт сюда креды ровно на время проверки; обработчик
 * ниже отдаёт их ТОЛЬКО тому прокси, чей адрес совпал, и только пока
 * запись не истекла. Дальше — обычный путь: активный прокси из списка.
 * Пароль в консоль не попадает и здесь.
 */
let probeAuth = null;

/**
 * Разрешить подстановку временных кредов проверки.
 * @param {null|{ip: string, port: number|string, login: string, pass: string, until: number}} value
 */
export function setProbeAuth(value) {
  probeAuth = value && typeof value === 'object'
    ? {
        ip: String(value.ip || '').toLowerCase(),
        port: parseInt(value.port, 10),
        login: typeof value.login === 'string' ? value.login : '',
        pass: typeof value.pass === 'string' ? value.pass : '',
        until: typeof value.until === 'number' ? value.until : Date.now() + 120000,
      }
    : null;
}

/** Совпал ли спросивший с адресом пробной проверки. */
function isProbeChallenger(details) {
  if (!probeAuth || Date.now() > probeAuth.until) return false;
  const ch = details.challenger;
  if (!ch || typeof ch !== 'object') return false;
  return challengerHost(ch.host) === probeAuth.ip && parseInt(ch.port, 10) === probeAuth.port;
}

/** Пометка «ждём дольше отведённого» — не значение и ни с чем не спутается. */
const TIMED_OUT = Symbol('timeout');

/**
 * Дождаться готовности, но не дольше трёх секунд.
 *
 * ЗАЧЕМ ГРАНИЦА. Если чтение хранилища упало так, что обещание не
 * разрешилось вовсе, asyncCallback не будет вызван никогда — и запрос
 * повиснет навсегда. Это хуже нынешнего бага: сейчас человек видит окно
 * и может его закрыть, а там страница просто не грузится и причины не видно.
 */
function waitReady() {
  const waiting = ready || reloadCreds();
  const limit = new Promise((resolve) => {
    setTimeout(() => resolve(TIMED_OUT), READY_TIMEOUT_MS);
  });
  return Promise.race([waiting, limit]);
}

/*
 * Этап 4: setLastError живёт в state.js (импорт сверху). Договор тот же:
 * null снимает ошибку, 'auth' и 'dead' ставят её, и запись идёт только
 * если значение изменилось — лишняя запись разбудила бы подписчиков на
 * изменения хранилища на ровном месте.
 */

/*
 * 7К.2 (А-1, решение человека 25.09): логин и пароль отдаются ТОЛЬКО тому
 * прокси, который их спросил. Браузер называет спросившего в
 * details.challenger { host, port } — это адрес прокси из настройки
 * (при нашем выключенном прокси пароль может спросить прокси системы или
 * другого расширения, и до 7К.2 обработчик отвечал ему нашими данными).
 * Сравнение с адресом записи, из которой взяты креды: хост — строки в
 * нижнем регистре, у IPv6 без квадратных скобок (challenger их не несёт),
 * порт — число. Чужой → ответ «без данных», попытка по requestId не
 * считается, ошибка не пишется. Поля challenger нет (старый браузер) —
 * как до 7К.2. Кредов нет вовсе (readCreds → null: активного прокси нет,
 * логин пустой, ключа прошлой версии нет) — ответ «без данных» до сверки
 * и счёта, попытка не считается, cancel нет (А-1б, решение человека
 * 28.09: отменять запрос без данных нечем и незачем — окно покажет
 * браузер). Строка в консоль — одна за жизнь воркера, без адреса
 * чужого прокси (флаг foreignNoted — память воркера, допустимо по 3.2).
 */
let foreignNoted = false;

/** Хост из challenger в форму записи: строчными, без квадратных скобок. */
function challengerHost(host) {
  return typeof host === 'string' ? host.trim().replace(/^\[|\]$/g, '').toLowerCase() : '';
}

/**
 * Спросил ли пароль тот прокси, чьи данные у нас готовы.
 * Нет challenger либо нет данных (сравнивать и отдавать нечего) — да.
 *
 * @param {Object} details
 * @param {{ip: string, port: number}|null} value
 */
function askedByOurs(details, value) {
  const ch = details.challenger;
  if (!ch || typeof ch !== 'object') return true;
  if (!value || typeof value.ip !== 'string' || !value.ip) return true;
  return challengerHost(ch.host) === value.ip.toLowerCase() && parseInt(ch.port, 10) === value.port;
}

/**
 * Обработчик запроса пароля.
 *
 * Слушатель СИНХРОННЫЙ, async на нём нет. Ответ уходит через asyncCallback,
 * и ровно один раз: повторный вызов Chrome воспринимает как ошибку.
 *
 * Порядок с 7К.2: ждём готовность кредов; кредов нет — ответ без данных
 * (А-1б); сверяем спросившего (А-1) и только потом считаем попытку по
 * requestId — чужому прокси попытка не засчитывается. Счётчик считает
 * только ответы с кредами (мастер-промт 3.4: «две попытки с кредами»).
 *
 * @param {Object} details
 * @param {(response: Object) => void} asyncCallback
 */
function onAuthRequired(details, asyncCallback) {
  let answered = false;
  const answer = (response) => {
    if (answered) return;
    answered = true;
    asyncCallback(response);
  };

  // Пароль спрашивает САЙТ, а не прокси — не наше дело. Выходим первым делом.
  if (details.isProxy !== true) {
    answer({});
    return;
  }

  /* 2.1: пробная проверка типа — свои креды, только своему адресу.
     Три захода, как у обычного пути: дальше браузеру отвечаем «отмена»,
     иначе он будет спрашивать бесконечно. */
  if (isProbeChallenger(details)) {
    const tries = (attempts.get(details.requestId) || 0) + 1;
    attempts.set(details.requestId, tries);
    if (tries >= 3) {
      attempts.delete(details.requestId);
      answer({ cancel: true });
      return;
    }
    answer({ authCredentials: { username: probeAuth.login, password: probeAuth.pass } });
    return;
  }

  waitReady()
    .then((value) => {
      if (value === TIMED_OUT) {
        console.error('[pxs] данные для входа не подготовились за отведённое время — запрос идёт без них');
        answer({});
        return;
      }

      if (!value) {
        // Прокси без авторизации — это нормальное состояние, не ошибка.
        // 7К.2 (А-1б, решение человека 28.09): кредов нет вовсе — отвечать и
        // сравнивать нечего, попытка не считается и запрос не отменяется
        // (до 28.09 третий такой запрос получал cancel и 'auth').
        answer({});
        return;
      }

      // 7К.2 (А-1): спросил другой прокси — наши данные ему не отдаются, попытка не считается.
      if (!askedByOurs(details, value)) {
        if (!foreignNoted) {
          foreignNoted = true;
          console.warn('[pxs] запрос пароля от другого прокси — не отвечаем');
        }
        answer({});
        return;
      }

      const tries = (attempts.get(details.requestId) || 0) + 1;
      attempts.set(details.requestId, tries);

      // Третий заход по тому же запросу: два раза наши данные уже не подошли.
      if (tries >= 3) {
        attempts.delete(details.requestId);
        answer({ cancel: true });
        setLastError('auth').catch((err) => {
          console.error('[pxs] не удалось записать причину ошибки:', err);
        });
        console.warn('[pxs] прокси отклонил логин и пароль — запрос отменён');
        return;
      }

      answer({ authCredentials: { username: value.login, password: value.pass } });
    })
    .catch((err) => {
      console.error('[pxs] подготовка данных для входа упала:', err);
      answer({});
    });
}

/** Запрос закончился любым способом — номер больше не встретится. */
function forget(details) {
  attempts.delete(details.requestId);
}

/*
 * ВСЕ addListener — НА ВЕРХНЕМ УРОВНЕ, синхронно, до любого ожидания.
 * Событие, разбудившее воркер, придёт раньше, чем закончится любое чтение.
 */
chrome.webRequest.onAuthRequired.addListener(
  onAuthRequired,
  { urls: ['<all_urls>'] },
  ['asyncBlocking'],
);

chrome.webRequest.onCompleted.addListener(forget, { urls: ['<all_urls>'] });
chrome.webRequest.onErrorOccurred.addListener(forget, { urls: ['<all_urls>'] });

/*
 * Данные для входа поменялись — перечитываем и снимаем висящую ошибку.
 *
 * ЗАЧЕМ СНИМАТЬ. Человек ввёл неверный пароль, получил 'auth', исправил
 * пароль на верный — и остался бы с красной ошибкой в интерфейсе навсегда.
 */
storage.subscribe((changes) => {
  const touched = changes[KEYS.STATE] || changes[KEYS.PROXIES] || changes[LEGACY_KEYS.PROXY_SETTING];
  if (!touched) return;

  const before = fingerprint(creds);
  reloadCreds().then((value) => {
    if (fingerprint(value) === before) return;
    setLastError(null).catch((err) => {
      console.error('[pxs] не удалось снять причину ошибки:', err);
    });
  });
});

/*
 * Первое чтение. Вызов функции, а не ожидание её результата: top-level await
 * задержал бы регистрацию слушателей выше.
 */
reloadCreds();

console.log('[pxs] подстановка логина и пароля прокси включена');
