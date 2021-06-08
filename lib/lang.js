import {
  arSA,
  cs,
  sk,
  da,
  de,
  el,
  enUS,
  es,
  fi,
  fr,
  faIR,
  he,
  hi,
  id,
  it,
  ja,
  mn,
  ms,
  nb,
  nl,
  pl,
  pt,
  ptBR,
  ro,
  ru,
  sv,
  ta,
  tr,
  uk,
  zhCN,
  zhTW,
  ca,
} from 'date-fns/locale';
import arSAMessages from 'lang-compiled/ar-SA.json';
import enMessages from 'lang-compiled/en-US.json';
import nlMessages from 'lang-compiled/nl-NL.json';
import zhCNMessages from 'lang-compiled/zh-CN.json';
import zhTWMessages from 'lang-compiled/zh-TW.json';
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
import ptMessages from 'lang-compiled/pt-PT.json';
import ptBRMessages from 'lang-compiled/pt-BR.json';
import roMessages from 'lang-compiled/ro-RO.json';
import nbNOMessages from 'lang-compiled/nb-NO.json';
import idMessages from 'lang-compiled/id-ID.json';
import ukMessages from 'lang-compiled/uk-UA.json';
import fiMessages from 'lang-compiled/fi-FI.json';
import csMessages from 'lang-compiled/cs-CZ.json';
import skMessages from 'lang-compiled/sk-SK.json';
import plMessages from 'lang-compiled/pl-PL.json';
import taMessages from 'lang-compiled/ta-IN.json';
import hiMessages from 'lang-compiled/hi-IN.json';
import heMessages from 'lang-compiled/he-IL.json';
import itMessages from 'lang-compiled/it-IT.json';
import faIRMessages from 'lang-compiled/fa-IR.json';
import msMYMessages from 'lang-compiled/ms-MY.json';
import caMessages from 'lang-compiled/ca-ES.json';

export const messages = {
  'ar-SA': arSAMessages,
  'en-US': enMessages,
  'nl-NL': nlMessages,
  'zh-CN': zhCNMessages,
  'zh-TW': zhTWMessages,
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
  'pt-PT': ptMessages,
  'pt-BR': ptBRMessages,
  'ro-RO': roMessages,
  'nb-NO': nbNOMessages,
  'id-ID': idMessages,
  'uk-UA': ukMessages,
  'fi-FI': fiMessages,
  'cs-CZ': csMessages,
  'sk-SK': skMessages,
  'pl-PL': plMessages,
  'ta-IN': taMessages,
  'hi-IN': hiMessages,
  'he-IL': heMessages,
  'it-IT': itMessages,
  'fa-IR': faIRMessages,
  'ms-MY': msMYMessages,
  'ca-ES': caMessages,
};

export const rtlLocales = ['ar-SA', 'fa-IR'];

export const dateLocales = {
  'ar-SA': arSA,
  'en-US': enUS,
  'nl-NL': nl,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'de-DE': de,
  'da-DK': da,
  'ru-RU': ru,
  'sv-SE': sv,
  'tr-TR': tr,
  'ja-JP': ja,
  'es-MX': es,
  'fr-FR': fr,
  'mn-MN': mn,
  'el-GR': el,
  'fo-FO': da,
  'pt-PT': pt,
  'pt-BR': ptBR,
  'ro-RO': ro,
  'nb-NO': nb,
  'id-ID': id,
  'uk-UA': uk,
  'fi-FI': fi,
  'cs-CZ': cs,
  'sk-SK': sk,
  'pl-PL': pl,
  'ta-In': ta,
  'hi-IN': hi,
  'he-IL': he,
  'it-IT': it,
  'fa-IR': faIR,
  'ms-MY': ms,
  'ca-ES': ca,
};

export const menuOptions = [
  { label: 'العربية', value: 'ar-SA', display: 'ar' },
  { label: '中文', value: 'zh-CN', display: 'cn' },
  { label: '中文(繁體)', value: 'zh-TW', display: 'tw' },
  { label: 'Català', value: 'ca-ES', display: 'ca' },
  { label: 'Čeština', value: 'cs-CZ', display: 'cs' },
  { label: 'Dansk', value: 'da-DK', display: 'da' },
  { label: 'Deutsch', value: 'de-DE', display: 'de' },
  { label: 'English', value: 'en-US', display: 'en' },
  { label: 'Español', value: 'es-MX', display: 'es' },
  { label: 'فارسی', value: 'fa-IR', display: 'fa' },
  { label: 'Føroyskt', value: 'fo-FO', display: 'fo' },
  { label: 'Français', value: 'fr-FR', display: 'fr' },
  { label: 'Ελληνικά', value: 'el-GR', display: 'el' },
  { label: 'עברית', value: 'he-IL', display: 'he' },
  { label: 'हिन्दी', value: 'hi-IN', display: 'hi' },
  { label: 'Italiano', value: 'it-IT', display: 'it' },
  { label: 'Bahasa Indonesia', value: 'id-ID', display: 'id' },
  { label: '日本語', value: 'ja-JP', display: 'ja' },
  { label: 'Malay', value: 'ms-MY', display: 'ms' },
  { label: 'Монгол', value: 'mn-MN', display: 'mn' },
  { label: 'Nederlands', value: 'nl-NL', display: 'nl' },
  { label: 'Norsk Bokmål', value: 'nb-NO', display: 'nb' },
  { label: 'Polski', value: 'pl-PL', display: 'pl' },
  { label: 'Português', value: 'pt-PT', display: 'pt' },
  { label: 'Português do Brasil', value: 'pt-BR', display: 'pt-BR' },
  { label: 'Русский', value: 'ru-RU', display: 'ru' },
  { label: 'Română', value: 'ro-RO', display: 'ro' },
  { label: 'Slovenčina', value: 'sk-SK', display: 'sk' },
  { label: 'Suomi', value: 'fi-FI', display: 'fi' },
  { label: 'Svenska', value: 'sv-SE', display: 'sv' },
  { label: 'தமிழ்', value: 'ta-IN', display: 'ta' },
  { label: 'Türkçe', value: 'tr-TR', display: 'tr' },
  { label: 'українська', value: 'uk-UA', display: 'uk' },
];
