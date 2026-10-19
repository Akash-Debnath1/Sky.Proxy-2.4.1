/* src/shared/dom.js — три помощника разметки, одинаковые в обоих окнах (3Б.6);
   с 7Л $ и esc читает и третье окно — страница запросов src/requests/.
   $  — первый узел по селектору;  $$ — все узлы по селектору, массивом;
   esc — экранирование текста для вставки в HTML-строку: & < > " → сущности.
   До 3Б.6 $ и $$ стояли копиями в popup.js, options.js и toast.js, esc — в
   popup.js и options.js; тела те же, скопированы без изменений.
   На верхнем уровне document не читается: $ и $$ обращаются к нему только
   при вызове, esc к нему не обращается вовсе — файл можно импортировать и
   там, где документа нет, как format.js и i18n.js. */
export const $  = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
