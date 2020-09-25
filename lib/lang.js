import { format } from 'date-fns';
import { enUS, nl, zhCN, tr, ru, de, ja, es, fr, da, sv, el } from 'date-fns/locale';
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
import svMessages from 'lang-compiled/sv-SE.json';
import grMessages from 'lang-compiled/el-GR.json';
import foMessages from 'lang-compiled/fo-FO.json';

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
  'sv-SE': svMessages,
  'el-GR': grMessages,
  'fo-FO': foMessages,
};

export const dateLocales = {
  'en-US': enUS,
  'nl-NL': nl,
  'zh-CN': zhCN,
  'de-DE': de,
  'da-DK': da,
  'ru-RU': ru,
  'sv-SE': sv,
  'tr-TR': tr,
  'ja-JP': ja,
  'es-MX': es,
  'fr-FR': fr,
  'mn-MN': enUS,
  'el-GR': el,
  'fo-FO': da,
};

export const menuOptions = [
  { label: 'English', value: 'en-US', display: 'en' },
  { label: '中文', value: 'zh-CN', display: 'cn' },
  { label: 'Dansk', value: 'da-DK', display: 'da' },
  { label: 'Deutsch', value: 'de-DE', display: 'de' },
  { label: 'Español', value: 'es-MX', display: 'es' },
  { label: 'Føroyskt', value: 'fo-FO', display: 'fo' },
  { label: 'Français', value: 'fr-FR', display: 'fr' },
  { label: 'Ελληνικά', value: 'el-GR', display: 'el' },
  { label: '日本語', value: 'ja-JP', display: 'ja' },
  { label: 'Монгол', value: 'mn-MN', display: 'mn' },
  { label: 'Nederlands', value: 'nl-NL', display: 'nl' },
  { label: 'Русский', value: 'ru-RU', display: 'ru' },
  { label: 'Svenska', value: 'sv-SE', display: 'sv' },
  { label: 'Türkçe', value: 'tr-TR', display: 'tr' },
];

export function dateFormat(date, str, locale) {
  return format(date, str, { locale: dateLocales[locale] || enUS });
}
