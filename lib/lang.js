import enMessages from 'lang-compiled/en.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import { format } from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';

export const messages = {
  en: enMessages,
  'zh-CN': zhCNMessages,
};

export const dateLocales = {
  en: enUS,
  'zh-CN': zhCN,
};

export const menuOptions = [
  { label: 'English', value: 'en', display: 'EN' },
  { label: '中文 (Chinese Simplified)', value: 'zh-CN', display: '中文' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
