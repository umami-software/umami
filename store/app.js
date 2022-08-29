import create from 'zustand';
import { DEFAULT_LOCALE, DEFAULT_THEME, LOCALE_CONFIG, THEME_CONFIG } from 'lib/constants';
import { getItem } from 'next-basics';

const initialState = {
  locale: getItem(LOCALE_CONFIG) || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
  shareToken: null,
  user: null,
  config: null,
};

const store = create(() => ({ ...initialState }));

export function setTheme(theme) {
  store.setState({ theme });
}

export function setLocale(locale) {
  store.setState({ locale });
}

export function setShareToken(shareToken) {
  store.setState({ shareToken });
}

export function setUser(user) {
  store.setState({ user });
}

export function setConfig(config) {
  store.setState({ config });
}

export default store;
