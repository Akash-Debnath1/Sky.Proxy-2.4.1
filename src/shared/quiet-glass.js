/**
 * src/shared/quiet-glass.js — «ТИХОЕ СТЕКЛО» ВО ВРЕМЯ ПРОКРУТКИ (2.5.1).
 *
 * Зачем. Размытие фона (backdrop-filter: blur(24px)) — самая дорогая
 * операция на странице: браузер пересчитывает размытие каждый кадр, пока
 * под панелью что-то движется, а при прокрутке движется всё. Замер окна
 * настроек (200 адресов, программный рендер): прокрутка шла 20 кадров в
 * секунду, без размытия — 60. На слабой машине это и читается как «интерфейс
 * тормозит».
 *
 * Что делаем. Пока идёт прокрутка, на <html> стоит класс qglass, и
 * glass.css снимает размытие у крупных поверхностей; через QUIET_MS после
 * последнего события прокрутки класс снимается и стекло возвращается. В
 * покое вид прежний, во время движения — тот же полупрозрачный слой без
 * blur (разницу на ходу не видно, а кадры возвращаются).
 *
 * Тот же класс ставится на время набора с клавиатуры: буква в поиске
   перерисовывает строки списка, и обновление содержимого панели с
   размытием — тоже лишний пересчёт фона на каждый кадр.
 *
 * Кому: окно настроек, попап и окно запросов — все три листают списки.
 * Слушатель passive: прокрутку он не тормозит и ничего не отменяет.
 */

const QUIET_MS = 160;

/**
 * Следить за прокруткой окна и держать класс qglass на <html>.
 * @param {Document} [doc]
 * @returns {void}
 */
export function quietGlass(doc = document) {
  const root = doc.documentElement;
  let timer = null;
  const start = () => {
    if (!root.classList.contains('qglass')) root.classList.add('qglass');
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      root.classList.remove('qglass');
    }, QUIET_MS);
  };
  doc.defaultView.addEventListener('scroll', start, { passive: true });
  /* прокрутка внутри панелей (меню прокси, список адресов) не доходит до
     окна: ловим её тем же классом на фазе перехвата */
  doc.addEventListener('scroll', start, { passive: true, capture: true });
  /* набор с клавиатуры: перерисовка списка под панелью — тот же повод
     отложить размытие до паузы */
  doc.addEventListener('input', start, { passive: true, capture: true });
  doc.addEventListener('keydown', start, { passive: true, capture: true });
  /* вкладка ушла в фон — незачем держать размытие включённым дольше */
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) { clearTimeout(timer); timer = null; root.classList.remove('qglass'); }
  });
}
