import deMessages from 'lang-compiled/de-DE.json';
import enMessages from 'lang-compiled/en.json';
import nlMessages from 'lang-compiled/nl-NL.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import { format } from 'date-fns';
import { de, enUS, nl, zhCN } from 'date-fns/locale';

export const messages = {
  'de-DE': deMessages,
  en: enMessages,
  'nl-NL': nlMessages,
  'zh-CN': zhCNMessages,
};

export const dateLocales = {
  en: enUS,
  'de-DE': de,
  'nl-NL': nl,
  'zh-CN': zhCN,
};

export const menuOptions = [
  { label: 'Deutsch', value: 'de-DE', display: 'DE' },
  { label: 'English', value: 'en', display: 'EN' },
  { label: 'Nederlands', value: 'nl-NL', display: 'NL' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN', display: '中文' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
