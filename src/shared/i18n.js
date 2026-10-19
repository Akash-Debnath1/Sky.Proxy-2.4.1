/* src/shared/i18n.js — тексты интерфейса из _locales через chrome.i18n.
   Заменяет прототипную пару «const I18N = {ru:{…}, en:{…}}; let L = I18N[lang]».
   Язык берётся из настроек браузера (решение плана: отдельной кнопки языка
   в расширении нет), поэтому переключать словарь на лету нечем и не нужно.
   Читают фон, попап, страница и с 7Л страница запросов src/requests/
   (msg и uiLang).

   В messages.json нет функций и нет множественного числа. Поэтому:
     msg('key')             — простой текст, как L.key;
     msgOpt('key')          — то же без предупреждения о пустом ответе;
     msg('key', ['a','b'])  — подстановки $1, $2 в тексте сообщения;
     msgN('key', n, subs?)  — число n уходит в $1, subs — в $2, $3 … , а
                              форма слова выбирается по правилам языка:
                              key_one / key_few / key_many / key_other.
                              Русский различает 1 / 2–4 / 5–20, английский —
                              1 / остальные; за это отвечает Intl.PluralRules,
                              а не самописный plural(). */
export const uiLang = chrome.i18n.getUILanguage();

/* Пустой ответ getMessage — почти всегда переименованный или потерянный
   ключ: на 3Б.2 и 3Б.3 их переносятся сотни, и тихая пустая строка там
   дороже предупреждения в консоли. Поэтому msg() и msgN() предупреждают.
   Ключ, которого может не быть по замыслу, читают через msgOpt(): так
   geoName показывает код страны вне таблицы как есть, без шума. */
export const msgOpt = (key, subs) => chrome.i18n.getMessage(key, subs);

export function msg(key, subs){
  const s = chrome.i18n.getMessage(key, subs);
  if(!s) console.warn(`[pxs] в _locales нет текста для ключа «${key}»`);
  return s;
}

const forms = new Intl.PluralRules(uiLang);
export function msgN(key, n, subs = []){
  const all = [String(n), ...subs];
  const s = chrome.i18n.getMessage(`${key}_${forms.select(n)}`, all)
         || chrome.i18n.getMessage(`${key}_other`, all);
  if(!s) console.warn(`[pxs] в _locales нет форм для ключа «${key}»`);
  return s;
}
