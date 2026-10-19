/* src/shared/toast.js — всплывающее сообщение наверху окна: в попапе — под
   верхней кромкой (7Л, правка человека 20.09), на странице — вровень с
   шапкой у правого края (на узких экранах — снизу по центру); место задают
   popup.css и options.css.
   Функция в двух прототипах совпадала побайтно и скопирована как есть.
   Разметка остаётся у каждого окна своя: <div class="toast" id="toast"
   role="status"> со <span id="toastT">; на странице внутри ещё <i class="t-dot">,
   в попапе ошибка показывается рамкой. Стили — в popup.css и options.css.
   3Б.6: своя копия $ снята — берётся из dom.js, как в обоих окнах. */
import { $ } from './dom.js';

let tt;
export function toast(msg, err){
  $('#toastT').textContent = msg;
  $('#toast').classList.toggle('err', !!err);
  $('#toast').classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => $('#toast').classList.remove('on'), 2200);
}
