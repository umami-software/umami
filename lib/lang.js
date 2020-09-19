import { format } from 'date-fns';
import { enUS, nl, zhCN, tr, ru, de, ja, es, fr, da } from 'date-fns/locale';
import enMessages from 'lang-compiled/en-US.json';
import nlMessages from 'lang-compiled/nl-NL.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import trTRMessages from 'lang-compiled/tr-TR.json';
import ruRUMessages from 'lang-compiled/ru-RU.json';
import deDEMessages from 'lang-compiled/de-DE.json';
import jaMessages from 'lang-compiled/ja-JP.json';
import esMXMessages from 'lang-compiled/es-MX.json';
import frMessages from 'lang-compiled/fr-FR.json';
import mnMNMessages from 'lang-compiled/mn-MN.json';
import daMessages from 'lang-compiled/da-DK.json';

export const messages = {
  'en-US': enMessages,
  'nl-NL': nlMessages,
  'zh-CN': zhCNMessages,
  'de-DE': deDEMessages,
  'ru-RU': ruRUMessages,
  'tr-TR': trTRMessages,
  'ja-JP': jaMessages,
  'es-MX': esMXMessages,
  'fr-FR': frMessages,
  'mn-MN': mnMNMessages,
  'da-DK': daMessages,
};

export const dateLocales = {
  'en-US': enUS,
  'nl-NL': nl,
  'zh-CN': zhCN,
  'de-DE': de,
  'da-DK': da,
  'ru-RU': ru,
  'tr-TR': tr,
  'ja-JP': ja,
  'es-MX': es,
  'fr-FR': fr,
  'mn-MN': enUS,
};

export const menuOptions = [
  { label: 'English', value: 'en-US', display: 'EN' },
  { label: '中文', value: 'zh-CN', display: 'CN' },
  { label: 'Dansk', value: 'da-DK', display: 'DA' },
  { label: 'Deutsch', value: 'de-DE', display: 'DE' },
  { label: 'Español', value: 'es-MX', display: 'ES' },
  { label: 'Français', value: 'fr-FR', display: 'FR' },
  { label: '日本語', value: 'ja-JP', display: 'JP' },
  { label: 'Монгол', value: 'mn-MN', display: 'MN' },
  { label: 'Nederlands', value: 'nl-NL', display: 'NL' },
  { label: 'Русский', value: 'ru-RU', display: 'RU' },
  { label: 'Turkish', value: 'tr-TR', display: 'TR' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
