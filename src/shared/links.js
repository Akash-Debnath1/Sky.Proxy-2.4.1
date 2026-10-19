/* src/shared/links.js — ссылки интерфейса на сайт proxys.io (7И, п. 7;
   решение человека 24.09: домен ссылок — из поля site файла сообщений,
   одинаково для всех локалей; без файла или при чужом site — основной
   хост). Закрывает вопрос, открытый с 10.09: в регионах, где основной
   домен без прокси недоступен, файл может переключить ссылки на зеркало.

   Словари хранят только ПУТИ (urlCart '/ru/cart', urlChecker, urlMy,
   urlContacts; в en — /en/…), хост приписывает siteUrl(path) — единственное
   место в окнах, где к пути приписывается схема и хост. Хост окна ставят из
   readAll().remote при старте и по подписке на remote (setSiteHost); до
   этого и при пустом или чужом site — SITE_HOSTS[0]. Список хостов — только
   SITE_HOSTS из constants.js (второго списка в проекте нет), поэтому
   единственный импорт файла — constants.js, у которого импортов нет.

   Обращений к браузеру и к странице здесь нет: файл гоняется в Node.
   Память модуля — текущий хост окна; окно живёт недолго, при открытии
   ставится заново из кеша. */
import { SITE_HOSTS } from './constants.js';

/* хост ссылок текущего окна; до чтения кеша — основной */
let host = SITE_HOSTS[0];

/**
 * Поставить хост ссылок из кеша файла сообщений: значение из SITE_HOSTS —
 * как есть, пусто, чужое или не строка — основной хост.
 * @param {*} site remote.site либо null
 * @returns {string} хост, который теперь действует
 */
export function setSiteHost(site){
  host = typeof site === 'string' && SITE_HOSTS.includes(site) ? site : SITE_HOSTS[0];
  return host;
}

/** Хост ссылок сейчас. */
export const siteHost = () => host;

/**
 * Полный адрес страницы сайта по пути из словаря: схема, хост и путь.
 * Путь без ведущей косой черты получает её; не строка — корень сайта.
 * @param {string} path '/ru/cart' и т. п. (msg('urlCart'))
 * @returns {string}
 */
export function siteUrl(path){
  const p = typeof path === 'string' ? path.trim() : '';
  return `https://${host}${p.startsWith('/') ? p : '/' + p}`;
}
