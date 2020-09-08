import enMessages from 'lang-compiled/en.json';
import nlMessages from 'lang-compiled/nl.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import { format } from 'date-fns';
import { enUS, nl, zhCN } from 'date-fns/locale';

export const messages = {
  en: enMessages,
  nl: nlMessages,
  'zh-CN': zhCNMessages,
};

export const dateLocales = {
  en: enUS,
  nl: nl,
  'zh-CN': zhCN,
};

export const menuOptions = [
  { label: 'English', value: 'en', display: 'EN' },
  { label: 'Nederlands', value: 'nl', display: 'NL' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN', display: '中文' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
