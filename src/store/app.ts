import { create } from 'zustand';
import {
  DATE_RANGE_CONFIG,
  DEFAULT_DATE_RANGE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_CONFIG,
  THEME_CONFIG,
} from 'lib/constants';
import { getItem } from 'next-basics';

const initialState = {
  locale: getItem(LOCALE_CONFIG) || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
  dateRange: getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE,
  shareToken: null,
  user: null,
  config: null,
};

const store = create(() => ({ ...initialState }));

export function setTheme(theme: string) {
  store.setState({ theme });
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

export function setDateRange(dateRange: object) {
  store.setState({ dateRange });
}

export default store;
