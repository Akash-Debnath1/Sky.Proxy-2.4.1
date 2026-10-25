/* tools/build-flag-icons.js — ЗНАЧКИ-ФЛАГИ ДЛЯ ПАНЕЛИ (2.5).
 *
 * Запуск (нужны playwright и собранный спрайт):
 *   node tools/build-flag-icons.js
 *
 * Зачем отдельные файлы, если есть спрайт. chrome.action.setIcon умеет
 * только путь к картинке (или ImageData), а CSS-спрайт с background-position
 * здесь не работает: иконку панели рисует браузер, а не страница. Поэтому
 * каждая страна, которая может оказаться на значке, выкладывается отдельным
 * PNG в двух размерах — 16 и 32 px (второй — для экранов высокой плотности;
 * сам браузер масштабировать умеет, но с готовым 32 чётче).
 *
 * Рисунок: флаг 4:3 по центру прозрачного квадрата, скруглённые углы и
 * тонкая тёмная обводка. Без обводки белые флаги (JP, PL…) на светлой
 * панели сливались бы с фоном.
 *
 * Источник — src/assets/flags.png (сетка 16 колонок, ячейка 51×36, см.
 * tools/build-flags.js). Коды берутся из src/shared/flagmap.js в том же
 * порядке, что и ячейки спрайта, поэтому таблица соответствия не нужна.
 *
 * Результат: src/assets/icons/flags/<cc>-16.png и <cc>-32.png на каждый код.
 */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPRITE = path.join(ROOT, 'src/assets/flags.png');
const MAP = path.join(ROOT, 'src/shared/flagmap.js');
const OUT = path.join(ROOT, 'src/assets/icons/flags');

const CELL_W = 51, CELL_H = 36, COLS = 16;
const SIZES = [16, 32];

/** Коды из flagmap.js — порядок ячеек спрайта. */
function readCodes() {
  const src = fs.readFileSync(MAP, 'utf8');
  const m = src.match(/FLAG_CODES = (\[[^\]]*\])/);
  if (!m) throw new Error('flagmap.js: FLAG_CODES не найдены');
  return JSON.parse(m[1]);
}

(async () => {
  const codes = readCodes();
  fs.mkdirSync(OUT, { recursive: true });
  const sprite = fs.readFileSync(SPRITE).toString('base64');

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const files = await page.evaluate(async ({ codes, sprite, CELL_W, CELL_H, COLS, SIZES }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + sprite;
    await img.decode();

    function draw(i, size) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d');
      const sx = (i % COLS) * CELL_W, sy = Math.floor(i / COLS) * CELL_H;
      const h = Math.round(size * 3 / 4), y = Math.round((size - h) / 2);
      const r = Math.max(1, size * 0.12);
      g.beginPath();
      g.roundRect(0, y, size, h, r);
      g.save();
      g.clip();
      g.drawImage(img, sx, sy, CELL_W, CELL_H, 0, y, size, h);
      g.restore();
      g.addPath ? null : null;
      g.beginPath();
      g.roundRect(0.5, y + 0.5, size - 1, h - 1, r);
      g.lineWidth = size >= 32 ? 1.5 : 1;
      g.strokeStyle = 'rgba(0,0,0,0.45)';
      g.stroke();
      return c.toDataURL('image/png');
    }

    const out = {};
    for (let i = 0; i < codes.length; i++) {
      for (const size of SIZES) out[`${codes[i]}-${size}`] = draw(i, size);
    }
    return out;
  }, { codes, sprite, CELL_W, CELL_H, COLS, SIZES });
  await browser.close();

  let bytes = 0;
  for (const [name, uri] of Object.entries(files)) {
    const buf = Buffer.from(uri.split(',')[1], 'base64');
    fs.writeFileSync(path.join(OUT, name + '.png'), buf);
    bytes += buf.length;
  }
  console.log('codes', codes.length, 'files', Object.keys(files).length, 'png', bytes, 'bytes');
})().catch((err) => { console.error(err); process.exit(1); });
