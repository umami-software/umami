import type { Locale } from 'date-fns';
import {
  arSA,
  az,
  be,
  bg,
  bn,
  bs,
  ca,
  cs,
  da,
  de,
  el,
  enGB,
  enUS,
  es,
  faIR,
  fi,
  fr,
  he,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  ka,
  km,
  ko,
  lt,
  mn,
  ms,
  nb,
  nl,
  pl,
  pt,
  ptBR,
  ro,
  ru,
  sk,
  sl,
  sv,
  ta,
  th,
  tr,
  uk,
  uz,
  vi,
  zhCN,
  zhTW,
} from 'date-fns/locale';

export const languages = {
  'ka-GE': { label: 'ქართული', dateLocale: ka },
  'ar-SA': { label: 'العربية', dateLocale: arSA, dir: 'rtl' },
  'az-AZ': { label: 'Azərbaycan', dateLocale: az },
  'be-BY': { label: 'Беларуская', dateLocale: be },
  'bg-BG': { label: 'български език', dateLocale: bg },
  'bn-BD': { label: 'বাংলা', dateLocale: bn },
  'bs-BA': { label: 'Bosanski', dateLocale: bs },
  'ca-ES': { label: 'Català', dateLocale: ca },
  'cs-CZ': { label: 'Čeština', dateLocale: cs },
  'da-DK': { label: 'Dansk', dateLocale: da },
  'de-CH': { label: 'Schwiizerdütsch', dateLocale: de },
  'de-DE': { label: 'Deutsch', dateLocale: de },
  'el-GR': { label: 'Ελληνικά', dateLocale: el },
  'en-GB': { label: 'English (UK)', dateLocale: enGB },
  'en-US': { label: 'English (US)', dateLocale: enUS },
  'es-ES': { label: 'Español', dateLocale: es },
  'fa-IR': { label: 'فارسی', dateLocale: faIR, dir: 'rtl' },
  'fi-FI': { label: 'Suomi', dateLocale: fi },
  'fo-FO': { label: 'Føroyskt' },
  'fr-FR': { label: 'Français', dateLocale: fr },
  'ga-ES': { label: 'Galacian (Spain)', dateLocale: es },
  'he-IL': { label: 'עברית', dateLocale: he, dir: 'rtl' },
  'hi-IN': { label: 'हिन्दी', dateLocale: hi },
  'hr-HR': { label: 'Hrvatski', dateLocale: hr },
  'hu-HU': { label: 'Hungarian', dateLocale: hu },
  'id-ID': { label: 'Bahasa Indonesia', dateLocale: id },
  'it-IT': { label: 'Italiano', dateLocale: it },
  'ja-JP': { label: '日本語', dateLocale: ja },
  'km-KH': { label: 'ភាសាខ្មែរ', dateLocale: km },
  'ko-KR': { label: '한국어', dateLocale: ko },
  'lt-LT': { label: 'Lietuvių', dateLocale: lt },
  'mn-MN': { label: 'Монгол', dateLocale: mn },
  'ms-MY': { label: 'Malay', dateLocale: ms },
  'my-MM': { label: 'မြန်မာဘာသာ', dateLocale: enUS },
  'nl-NL': { label: 'Nederlands', dateLocale: nl },
  'nb-NO': { label: 'Norsk Bokmål', dateLocale: nb },
  'pl-PL': { label: 'Polski', dateLocale: pl },
  'pt-BR': { label: 'Português do Brasil', dateLocale: ptBR },
  'pt-PT': { label: 'Português', dateLocale: pt },
  'ro-RO': { label: 'Română', dateLocale: ro },
  'ru-RU': { label: 'Русский', dateLocale: ru },
  'si-LK': { label: 'සිංහල', dateLocale: id },
  'sk-SK': { label: 'Slovenčina', dateLocale: sk },
  'sl-SI': { label: 'Slovenščina', dateLocale: sl },
  'sv-SE': { label: 'Svenska', dateLocale: sv },
  'ta-IN': { label: 'தமிழ்', dateLocale: ta },
  'th-TH': { label: 'ภาษาไทย', dateLocale: th },
  'tr-TR': { label: 'Türkçe', dateLocale: tr },
  'uk-UA': { label: 'українська', dateLocale: uk },
  'ur-PK': { label: 'Urdu (Pakistan)', dateLocale: uk, dir: 'rtl' },
  'uz-UZ': { label: 'O‘zbekcha', dateLocale: uz },
  'vi-VN': { label: 'Tiếng Việt', dateLocale: vi },
  'zh-CN': { label: '中文', dateLocale: zhCN },
  'zh-TW': { label: '中文(繁體)', dateLocale: zhTW },
};

let hour12: boolean | undefined;

const hour12Locales = new Map<Locale, Locale>();

// Overrides the clock format of localized time tokens (p/pp/PPpp), which
// otherwise follow the locale's own convention. Pass undefined to disable.
export function setHour12(value: boolean | undefined) {
  hour12 = value;
  hour12Locales.clear();
}

export function getHour12() {
  return hour12;
}

function getHour12Locale(locale: Locale): Locale {
  let override = hour12Locales.get(locale);

  if (!override) {
    override = {
      ...locale,
      formatLong: {
        ...locale.formatLong,
        time: ({ width }) => {
          const patterns: Record<string, string> = hour12
            ? {
                short: 'h:mm a',
                medium: 'h:mm:ss a',
                long: 'h:mm:ss a zzz',
                full: 'h:mm:ss a zzzz',
              }
            : {
                short: 'HH:mm',
                medium: 'HH:mm:ss',
                long: 'HH:mm:ss zzz',
                full: 'HH:mm:ss zzzz',
              };
          return patterns[width] ?? locale.formatLong.time({ width });
        },
      },
    };

    hour12Locales.set(locale, override);
  }

  return override;
}

export function getDateLocale(locale: string) {
  const dateLocale = languages[locale]?.dateLocale || enUS;

  return hour12 === undefined ? dateLocale : getHour12Locale(dateLocale);
}

export function getTextDirection(locale: string) {
  return languages[locale]?.dir || 'ltr';
}
