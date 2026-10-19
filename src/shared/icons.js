/* src/shared/icons.js — общие SVG обоих окон. На 3Б.1 сюда вынесены девять
   строк, которые в обоих прототипах совпадали побайтно; строки скопированы из
   прототипов без изменений: размеры, штрихи и цвета — те же. Вставляются
   через innerHTML, как и в прототипах (это статические строки, не данные
   пользователя).
   3Б.6: два флага меню языка сняты — меню нет ни в одном окне (решение
   07.09), обращений к ним не осталось; британский флаг и так побайтно
   равнялся flag('GB') из format.js. Констант стало семь.

   Скрытый блок градиентов <svg width="0" height="0"> (101 948 символов, сцена
   коннектора) сюда НЕ вынесен намеренно: ссылки url(#id) между документами
   не работают, блок остаётся в конце body обоих HTML. См. DECISIONS от 01.09. */

/* попап: крестик карточки уведомления .nx (popup.js) и копия в разметке у крестика плашки выбора #pickCancel (7Л); страница: копия в разметке у кнопки сброса поиска #lqX */
export const ICON_CLOSE = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="m2 2 8 8M10 2l-8 8"/></svg>';

/* стрелка «→»: попап — «Другие способы» (.am-more), адреса и «Продлить в кабинете» в панели уведомлений, копия в разметке у #spAll (7Ж); страница — «Продлить» в чипе истёкшего (expChip) */
export const ICON_ARROW = '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8h9.6"/><path d="m8.8 3.8 4.2 4.2-4.2 4.2"/></svg>';

/* метка срока: попап — значок срока строки списка (.x-ico), карточка «Истекают» и значок баннера clock; страница — чип срока в герое и в строке */
export const ICON_CLOCK = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.3 2.3"/></svg>';

/* «срок истёк» и тревога: попап — .x-ico bad, карточки «Истекли» и «не отвечает», значок баннера warn; страница — чип истёкшего в герое и в строке */
export const ICON_WARN = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.2 14.6 13.4H1.4z"/><path d="M8 6.6v3"/><path d="M8 12h.01"/></svg>';

/* попап: копия в разметке у подписи «Списки» .ls-i (16px, 7Л); страница: значок раздела списков в блоке настроек (.opt-i) */
export const ICON_LIST = '<svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3.2" width="10" height="11" rx="1.8"/><path d="M5.8 1.8v2.6M10.2 1.8v2.6M5.2 7.6h5.6M5.2 10.2h3.6"/></svg>';

/* шестерёнка: попап — кнопка строки меню .pm-gear («открыть в настройках»); страница — кнопка меню строки .ico */
export const ICON_GEAR = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><circle cx="8" cy="8" r="2.1"/><path d="M13.2 8c0-.4 0-.7-.1-1.1l1.4-1-1.2-2.1-1.6.6a5 5 0 0 0-1.9-1.1L9.5 1.6h-3l-.3 1.7a5 5 0 0 0-1.9 1.1l-1.6-.6-1.2 2.1 1.4 1a5.6 5.6 0 0 0 0 2.2l-1.4 1 1.2 2.1 1.6-.6c.6.5 1.2.9 1.9 1.1l.3 1.7h3l.3-1.7a5 5 0 0 0 1.9-1.1l1.6.6 1.2-2.1-1.4-1c.1-.4.1-.7.1-1.1Z"/></svg>';

/* серый прямоугольник вместо флага, когда страна не известна: запасной ответ flag() в обоих файлах */
export const FLAG_NONE = '<svg class="fl" width="17" height="12" viewBox="0 0 17 12"><rect width="17" height="12" fill="#2B2B2B"/></svg>';

/* 3Б.6: три значка, которые в двух окнах (или в двух местах страницы)
   совпадали всем, кроме размера, — потому и не попали в «побайтные» 3Б.1.
   Солнце и луна кнопки темы: 20×20 в попапе, 19×19 на странице; глаз
   «скрыть пароль»: 16×16 в герое страницы, 17×17 в её настройках. Поэтому
   не константы, а функции от размера: iconSun(20) даёт побайтно ту строку,
   что стояла в popup.js, iconSun(19) — что в options.js. Копии в статичной
   разметке (кнопка темы в обоих HTML) остаются по решению 07.09. */
export const iconSun = s => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none"><g stroke="#C09644" stroke-linecap="round"><path d="M10 1.2v2.3M10 16.5v2.3M1.2 10h2.3M16.5 10h2.3" stroke-width="2.2"/><path d="m3.9 3.9 1.5 1.5M14.6 14.6l1.5 1.5M16.1 3.9l-1.5 1.5M5.4 14.6l-1.5 1.5" stroke-width="1.7"/></g><circle cx="10" cy="10" r="4.2" fill="#DFB457" stroke="#B78F3A" stroke-width="1.1"/></svg>`;
export const iconMoon = s => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none"><path d="M17.5 10.66A7.5 7.5 0 1 1 9.34 2.5a5.83 5.83 0 0 0 8.16 8.16z" fill="#6E7EA8" stroke="#57678F" stroke-width="1.1" stroke-linejoin="round"/><circle cx="14.7" cy="4.4" r="1" fill="#F2B300"/><circle cx="17.3" cy="7.4" r=".7" fill="#F2B300"/></svg>`;
export const iconEyeOff = s => `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 3.6C1.9 4.5 1.6 8 1.6 8s2.3 4.3 6.4 4.3c1.2 0 2.3-.4 3.2-.9M6.3 3.9c.5-.1 1.1-.2 1.7-.2 4.1 0 6.4 4.3 6.4 4.3s-.6 1.1-1.7 2.2"/><path d="M6.6 6.6a2 2 0 0 0 2.8 2.8"/><path d="m2.2 2.2 11.6 11.6"/></svg>`;
