/**
 * Значок на панели браузера (7Г; 7.12 счётчик; 2.5 — флаг страны).
 *
 * Сюда из service-worker.js переехал setIcon сессии 6.1 целиком: база
 * значка по состоянию (цветной — прокси включён, чёрно-белый — выключен,
 * как в 1.4.7.11) выставляется здесь же. Второго setIcon в проекте нет.
 * Всё остальное — на плашке браузера (chrome.action.setBadgeText).
 *
 * ФЛАГ СТРАНЫ НА ЗНАЧКЕ (2.5, слово человека 25.10: «на месте значка
 * должен быть флаг того IP, к которому подключился»). Пока прокси
 * включён и у активного адреса известна страна, значок — флаг этой
 * страны; выключен прокси или страна неизвестна — прежний логотип
 * (цветной при включённом, чёрно-белый при выключенном). Это отменяет
 * прежнее решение 17.09 «флага на значке нет»: тогда его сняли без
 * опоры на данные, а теперь человек прямо попросил обратного.
 *
 * Почему отдельные файлы, а не спрайт: chrome.action.setIcon принимает
 * путь к картинке, а не CSS-фон, — спрайт с background-position панель
 * не понимает. Значки 16 и 32 px на страну собирает
 * tools/build-flag-icons.js из того же спрайта src/assets/flags.png
 * (src/assets/icons/flags/<cc>-16.png и <cc>-32.png). Незнакомый код,
 * которого нет в flagmap.js, — логотип: битую картинку не ставим.
 *
 * ПОЧЕМУ ПЛАШКА БРАУЗЕРА. Кнопка действия в панели — 28×28 dp, наш
 * значок — 16×16 dp в её центре, рисовать мы можем только внутри этих 16,
 * и всё нарисованное там мельче плашки: её браузер рисует у правого
 * нижнего угла кнопки высотой 14 dp, с выходом за значок
 * (chrome/browser/ui/extensions/icon_with_badge_image_source.cc), а
 * сдвинуть или уменьшить её нельзя. Ни разрешений, ни холста не требует.
 *
 * ЧТО НА ПЛАШКЕ — один слот, по старшинству (решение человека 17.09,
 * шестая выдача 7Г: ошибка весит больше уведомлений):
 *   стоит ошибка         — красная плашка без текста (ERROR_TEXT — пробел:
 *                          плашка есть, текста нет; решение 11.09: lastError
 *                          'auth' или 'dead' при включённом, пока ошибка не
 *                          снята — так она видна при закрытых окнах). Форма
 *                          плашки у браузера одна — прямоугольник со
 *                          скруглением; треугольника или «!» не будет
 *                          намеренно: красная плашка с числом — это
 *                          истёкший прокси, пустая красная — ошибка;
 *   есть непрочитанные   — их число, «9+» при больше девяти; фон — по тону
 *                          сильнейшего непрочитанного (7И, решение
 *                          человека 23.09): 'bad' — красный (истёкший,
 *                          обрыв, баннер «Срочно»), 'warn' — жёлтый
 *                          («Истекают», ключ, пропал, баннер «Важно»),
 *                          'info' — НЕЙТРАЛЬНЫЙ, тёмная плашка («новых в
 *                          аккаунте» — классическое, самолечение, заменён,
 *                          баннер «Классическое»);
 *   иначе                — плашки нет.
 * Что считать непрочитанным и какой у него тон, решает notifs.js — сюда
 * приходит готовое число и тон. Цвет текста — setBadgeTextColor, если
 * метод есть (Chrome 110+); без него браузер сам берёт контрастный.
 *
 * НЕЙТРАЛЬНАЯ ПЛАШКА — ПО ТЕМЕ РАСШИРЕНИЯ (settings.theme; поправка
 * человека 23.09: «у светлой темы своё отображение классической плашки, оно
 * не тёмное — нельзя делать чёрную плашку на белой»): тёмная тема — почти
 * чёрная плашка в тон нейтральной карточки со светлым текстом, светлая —
 * светлая нейтральная с тёмным текстом. Панель браузера расширению не
 * видна, тема расширения — лучшее приближение (ограничение принято и
 * записано). Оттенок — по глазу человека (NEUTRAL, выбор 23.09; вторые
 * кандидаты сняты 7К.2, А-9); красная и жёлтая — как были.
 *
 * Пути к файлам значка — ПОЛНЫМИ АДРЕСАМИ через chrome.runtime.getURL
 * (находка человека 10.09: относительный путь из воркера считается от
 * src/background/ и файл не находится). Обещания Chrome здесь никто не
 * ждёт (как в 6.1): значок выставляется мимоходом, ломать фон или
 * задерживать старт он не должен; отказ — в консоль.
 *
 * Память воркера (допустимо, 3.2): последний выставленный набор — чтобы
 * не дёргать браузер без изменений. После сна пуста: первая перерисовка
 * пройдёт лишний раз — безвредно.
 */

import { ICONS } from '../shared/constants.js';
import { FLAG_CODES } from '../shared/flagmap.js';   /* 2.5: значки-флаги для панели */

/**
 * Текст плашки при ошибке: пробел — плашка минимальной ширины (квадрат)
 * без текста; пустая строка плашку убрала бы совсем.
 */
const ERROR_TEXT = ' ';

/** Цвета красной и жёлтой плашки — свои, здесь; с токенами окон (tokens.css --bad, --warn) они не совпадают. */
const RED = '#D93B2C';
const YELLOW = '#E6B84C';
const ON_RED = '#FFFFFF';
const ON_YELLOW = '#1F1A05';

/*
 * Нейтральная плашка (7И) — по теме расширения (выбор человека по глазу
 * 23.09; вторые кандидаты #141414 / #F7F7F7 сняты решением 25.09, 7К.2 А-9):
 *   тёмная тема:  '#050505' (--well: на герое #191919 читается как чёрная —
 *                 «по сути чёрная»); текст '#F0F0F0' (--ink);
 *   светлая тема: '#E9E9E9' (--well); текст '#1A1A1A' (--ink).
 */
const NEUTRAL_DARK_1 = '#050505';
const NEUTRAL_LIGHT_1 = '#E9E9E9';
const NEUTRAL = Object.freeze({
  dark: Object.freeze({ color: NEUTRAL_DARK_1, textColor: '#F0F0F0' }),
  light: Object.freeze({ color: NEUTRAL_LIGHT_1, textColor: '#1A1A1A' }),
});

/** Тоны непрочитанных — те же три, что у notifs.js; иное читается как 'info'. */
const TONES = Object.freeze(['bad', 'warn', 'info']);

/* что выставлено сейчас — память воркера */
let shown = null;

/**
 * Привести вход к форме, по которой считается «то же самое».
 * @param {{enabled?: boolean, unread?: number, tone?: string|null, theme?: string, lastError?: boolean}} view
 */
function norm(view) {
  const v = view && typeof view === 'object' ? view : {};
  const unread = Number.isInteger(v.unread) && v.unread > 0 ? v.unread : 0;
  return {
    enabled: v.enabled === true,
    unread,
    tone: unread > 0 ? (TONES.includes(v.tone) ? v.tone : 'info') : null,
    theme: v.theme === 'light' ? 'light' : 'dark',
    lastError: v.lastError === true,
    cc: flagCode(v.cc),   /* 2.5: страна активного прокси (или null) */
  };
}

/**
 * Код страны из строки: две латинские буквы, известные спрайту. Всё
 * прочее — null: значок тогда остаётся логотипом.
 *
 * @param {unknown} cc
 * @returns {string|null}
 */
function flagCode(cc) {
  if (typeof cc !== 'string') return null;
  const code = cc.trim().toLowerCase();
  return FLAG_CODES.includes(code) ? code : null;
}

/**
 * Выставить значок и плашку по набору. Совпал с прошлым — не делать ничего.
 * Ошибок наружу не бросает: пишет в консоль.
 *
 * @param {{enabled: boolean, unread: number, tone: string|null, theme: string, lastError: boolean, cc?: string|null}} view
 *   enabled — прокси включён (база цветная); unread — непрочитанных
 *   уведомлений; tone — сильнейший тон среди них ('bad' | 'warn' | 'info',
 *   notifs.tone); theme — тема расширения (settings.theme) для нейтральной
 *   плашки; lastError — стоит ошибка ('auth' или 'dead'); cc — страна
 *   активного прокси (2.5; флаг вместо логотипа при включённом прокси)
 * @returns {Promise<void>}
 */
export async function render(view) {
  const v = norm(view);
  const key = JSON.stringify(v);
  if (key === shown) return;
  shown = key;
  setIcon(v.enabled, v.cc);
  await setBadge(pickBadge(v));
}

/**
 * Значок по состоянию: флаг страны, если прокси включён и страна
 * известна (2.5), иначе прежний логотип — цветной при включённом
 * прокси и чёрно-белый при выключенном.
 *
 * @param {boolean} enabled
 * @param {string|null} cc код страны из flagCode()
 */
function setIcon(enabled, cc) {
  const path = {};
  if (enabled && cc) {
    path[16] = chrome.runtime.getURL(`src/assets/icons/flags/${cc}-16.png`);
    path[32] = chrome.runtime.getURL(`src/assets/icons/flags/${cc}-32.png`);
  } else {
    const set = enabled ? ICONS.on : ICONS.off;
    for (const size of Object.keys(set)) path[size] = chrome.runtime.getURL(set[size]);
  }
  chrome.action.setIcon({ path }).catch((err) => {
    shown = null;
    console.warn('[pxs] значок не выставлен:', err);
  });
}

/**
 * Что показать на плашке — по старшинству из шапки.
 * @returns {{text: string, color: string, textColor: string}}
 */
function pickBadge(v) {
  if (v.enabled && v.lastError) return { text: ERROR_TEXT, color: RED, textColor: ON_RED };
  if (v.unread > 0) {
    const text = v.unread > 9 ? '9+' : String(v.unread);
    if (v.tone === 'bad') return { text, color: RED, textColor: ON_RED };
    if (v.tone === 'warn') return { text, color: YELLOW, textColor: ON_YELLOW };
    return { text, ...NEUTRAL[v.theme] };
  }
  return { text: '', color: RED, textColor: ON_RED };
}

/** Плашка браузера: текст, фон, цвет текста; пустой текст — плашки нет. */
async function setBadge(badge) {
  try {
    await chrome.action.setBadgeText({ text: badge.text });
    if (badge.text === '') return;
    await chrome.action.setBadgeBackgroundColor({ color: badge.color });
    if (typeof chrome.action.setBadgeTextColor === 'function') {
      await chrome.action.setBadgeTextColor({ color: badge.textColor });
    }
  } catch (err) {
    shown = null;
    console.warn('[pxs] плашка на значке не выставлена:', err);
  }
}
