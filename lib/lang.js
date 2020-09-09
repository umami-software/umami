import { format } from 'date-fns';
import { enUS, nl, zhCN, tr, ru, de } from 'date-fns/locale';
import enMessages from 'lang-compiled/en.json';
import nlMessages from 'lang-compiled/nl-NL.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import trTRMessages from 'lang-compiled/tr-TR.json';
import ruRUMessages from 'lang-compiled/ru-RU.json';
import deDEMessages from 'lang-compiled/de-DE.json';

export const messages = {
  en: enMessages,
  'nl-NL': nlMessages,
  'zh-CN': zhCNMessages,
  'de-DE': deDEMessages,
  'ru-RU': ruRUMessages,
  'tr-TR': trTRMessages,
};

export const dateLocales = {
  en: enUS,
  'nl-NL': nl,
  'zh-CN': zhCN,
  'de-DE': de,
  'ru-RU': ru,
  'tr-TR': tr,
};

export const menuOptions = [
  { label: 'English', value: 'en', display: 'EN' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN', display: '中文' },
  { label: 'Deutsch (German)', value: 'de-DE', display: 'DE' },
  { label: 'Nederlands (Dutch)', value: 'nl-NL', display: 'NL' },
  { label: 'Русский (Russian)', value: 'ru-RU', display: 'РУ' },
  { label: 'Turkish', value: 'tr-TR', display: 'TR' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
