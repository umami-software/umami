import { getItem, setItem, removeItem } from '@/lib/storage';
import {
  AUTH_TOKEN,
  LOCALE_CONFIG,
  TIMEZONE_CONFIG,
  DATE_RANGE_CONFIG,
  THEME_CONFIG,
} from './constants';
import { setLocale, setTimezone, setDateRangeValue } from '@/store/app';

export function getClientAuthToken() {
  return getItem(AUTH_TOKEN);
}

export function setClientAuthToken(token: string) {
  setItem(AUTH_TOKEN, token);
}

export function removeClientAuthToken() {
  removeItem(AUTH_TOKEN);
}

export function setClientPreferences(preferences: {
  dateRange?: string | null;
  timezone?: string | null;
  language?: string | null;
  theme?: string | null;
}) {
  const { dateRange, timezone, language, theme } = preferences;

  if (dateRange !== undefined) {
    if (dateRange === null) {
      removeItem(DATE_RANGE_CONFIG);
    } else {
      setItem(DATE_RANGE_CONFIG, dateRange);
      setDateRangeValue(dateRange);
    }
  }

  if (timezone !== undefined) {
    if (timezone === null) {
      removeItem(TIMEZONE_CONFIG);
    } else {
      setItem(TIMEZONE_CONFIG, timezone);
      setTimezone(timezone);
    }
  }

  if (language !== undefined) {
    if (language === null) {
      removeItem(LOCALE_CONFIG);
    } else {
      setItem(LOCALE_CONFIG, language);
      setLocale(language);
    }
  }

  if (theme !== undefined) {
    if (theme === null) {
      removeItem(THEME_CONFIG);
    } else {
      setItem(THEME_CONFIG, theme);
    }
  }
}

export function removeClientPreferences() {
  removeItem(DATE_RANGE_CONFIG);
  removeItem(TIMEZONE_CONFIG);
  removeItem(THEME_CONFIG);
}
