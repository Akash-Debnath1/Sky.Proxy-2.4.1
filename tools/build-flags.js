/* tools/build-flags.js — СБОРКА СПРАЙТА ФЛАГОВ (2.4).
 *
 * Запуск (нужны пакеты flag-icons и playwright):
 *   npm i flag-icons playwright && npx playwright install chromium
 *   node tools/build-flags.js node_modules/flag-icons/flags/4x3
 *
 * Источник — набор flag-icons (MIT, github.com/lipis/flag-icons), файлы
 * 4x3/*.svg. Все двухбуквенные коды раскладываются в сетку 16 колонок,
 * ячейка 51×36 px (трёхкратный запас к 17×12), и снимаются одним PNG.
 * Результат: src/assets/flags.png + src/shared/flagmap.js (порядок ячеек).
 * Служебные клетки pc и xx пропускаются: страны за ними нет.
 */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const SRC = process.argv[2] || '/tmp/fi/package/flags/4x3';
const ROOT = path.resolve(__dirname, '..');
const OUT_PNG = path.join(ROOT, 'src/assets/flags.png');
const OUT_JS = path.join(ROOT, 'src/shared/flagmap.js');
const COLS = 16, CW = 51, CH = 36, SCALE = 3;

(async () => {
  /* pc и xx — служебные клетки flag-icons, страны за ними нет */
  const SKIP = new Set(['pc', 'xx']);
  const codes = fs.readdirSync(SRC).filter(f => /^[a-z]{2}\.svg$/.test(f))
    .map(f => f.slice(0, 2)).filter(c => !SKIP.has(c)).sort();
  const rows = Math.ceil(codes.length / COLS);
  const cells = codes.map((cc, i) => {
    const svg = fs.readFileSync(path.join(SRC, cc + '.svg'));
    const b64 = svg.toString('base64');
    return `<div style="position:absolute;left:${(i % COLS) * CW}px;top:${Math.floor(i / COLS) * CH}px;width:${CW}px;height:${CH}px;overflow:hidden">
      <img src="data:image/svg+xml;base64,${b64}" style="width:100%;height:100%;object-fit:cover;display:block">
    </div>`;
  }).join('');

  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}</style>
    <div style="position:relative;width:${COLS * CW}px;height:${rows * CH}px;background:transparent">${cells}</div>`;

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: COLS * CW, height: rows * CH }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT_PNG, omitBackground: true, clip: { x: 0, y: 0, width: COLS * CW, height: rows * CH } });
  await browser.close();

  const list = JSON.stringify(codes);
  fs.writeFileSync(OUT_JS, `/**
 * src/shared/flagmap.js — СПРАЙТ ФЛАГОВ (2.4), СОБРАН АВТОМАТИЧЕСКИ.
 *
 * Коды стран в порядке ячеек спрайта src/assets/flags.png: сетка 16
 * колонок, ячейка 17×12 (в файле — 51×36, трёхкратный запас для
 * экранов с высокой плотностью). Позицию считает flag() в format.js:
 * x = -(i % 16) * 17, y = -floor(i / 16) * 12 при background-size
 * 272px × {рядов}·12px.
 *
 * Откуда рисунки: пакет flag-icons (MIT, github.com/lipis/flag-icons),
 * файлы flags/4x3. Своих рецептов у нас больше нет: ручных флагов было
 * 52, а адреса прокси приходят со всего мира, и «PH» без флага — ровно
 * тот случай, ради которого 2.4 и делалась.
 *
 * Размеры: ${codes.length} кодов, ${rows} рядов, спрайт ${COLS * CW}×${rows * CH}.
 * Пересобрать: node testenv/build-flags.js (нужен пакет flag-icons).
 */
export const FLAG_CODES = ${list};
export const FLAG_COLS = ${COLS};
export const FLAG_ROWS = ${rows};
`);
  console.log('codes', codes.length, 'rows', rows, 'png', fs.statSync(OUT_PNG).size, 'bytes');
})().catch(e => { console.error(e); process.exit(1); });
