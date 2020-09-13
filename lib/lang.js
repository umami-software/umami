import { format } from 'date-fns';
import { enUS, nl, zhCN, tr, ru, de, ja, es } from 'date-fns/locale';
import enMessages from 'lang-compiled/en-US.json';
import nlMessages from 'lang-compiled/nl-NL.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import trTRMessages from 'lang-compiled/tr-TR.json';
import ruRUMessages from 'lang-compiled/ru-RU.json';
import deDEMessages from 'lang-compiled/de-DE.json';
import jaMessages from 'lang-compiled/ja-JP.json';
import esMXMessages from 'lang-compiled/es-MX.json';

export const messages = {
  'en-US': enMessages,
  'nl-NL': nlMessages,
  'zh-CN': zhCNMessages,
  'de-DE': deDEMessages,
  'ru-RU': ruRUMessages,
  'tr-TR': trTRMessages,
  'ja-JP': jaMessages,
  'es-MX': esMXMessages,
};

export const dateLocales = {
  'en-US': enUS,
  'nl-NL': nl,
  'zh-CN': zhCN,
  'de-DE': de,
  'ru-RU': ru,
  'tr-TR': tr,
  'ja-JP': ja,
  'es-MX': es,
};

export const menuOptions = [
  { label: 'English', value: 'en', display: 'EN' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN', display: '中文' },
  { label: 'Nederlands (Dutch)', value: 'nl-NL', display: 'NL' },
  { label: 'Deutsch (German)', value: 'de-DE', display: 'DE' },
  { label: '日本語 (Japanese)', value: 'ja-JP', display: '日本語' },
  { label: 'Русский (Russian)', value: 'ru-RU', display: 'РУ' },
  { label: 'Turkish', value: 'tr-TR', display: 'TR' },
  { label: 'Español (Mexicano)', value: 'es-MX', display: 'ES' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
