import {
  DATE_RANGE_CONFIG,
  DEFAULT_DATE_RANGE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  DEFAULT_TIME_UNIT,
  LOCALE_CONFIG,
  THEME_CONFIG,
  TIME_UNIT_CONFIG,
  TIMEZONE_CONFIG,
} from 'lib/constants';
import { getTimezone } from 'lib/date';
import { getItem } from 'next-basics';
import { create } from 'zustand';

function getDefaultTheme() {
  return typeof window !== 'undefined'
    ? window?.matchMedia('(prefers-color-scheme: dark)')?.matches
      ? 'dark'
      : 'light'
    : 'light';
}

const initialState = {
  locale: getItem(LOCALE_CONFIG) || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || getDefaultTheme() || DEFAULT_THEME,
  timezone: getItem(TIMEZONE_CONFIG) || getTimezone(),
  dateRange: getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE,
  timeUnit: getItem(TIME_UNIT_CONFIG) || DEFAULT_TIME_UNIT,
  shareToken: null,
  user: null,
  config: null,
};

const store = create(() => ({ ...initialState }));

export function setTheme(theme: string) {
  store.setState({ theme });
}

export function setTimezone(timezone: string) {
  store.setState({ timezone });
}

export function setLocale(locale: string) {
  store.setState({ locale });
}

export function setShareToken(shareToken: string) {
  store.setState({ shareToken });
}

export function setUser(user: object) {
  store.setState({ user });
}

export function setConfig(config: object) {
  store.setState({ config });
}

export function setDateRange(dateRange: string | object) {
  store.setState({ dateRange });
}

export function setTimeUnit(timeUnit: string | object) {
  store.setState({ timeUnit });
}

export default store;
