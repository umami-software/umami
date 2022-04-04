import create from 'zustand';
import {
  DASHBOARD_CONFIG,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_CONFIG,
  THEME_CONFIG,
  DEFAULT_WEBSITE_LIMIT,
} from 'lib/constants';
import { getItem, setItem } from 'lib/web';

export const defaultDashboardConfig = {
  showCharts: true,
  limit: DEFAULT_WEBSITE_LIMIT,
};

const initialState = {
  locale: getItem(LOCALE_CONFIG) || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
  dashboard: getItem(DASHBOARD_CONFIG) || defaultDashboardConfig,
  shareToken: null,
  user: null,
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

export function setDashboard(dashboard) {
  store.setState({ dashboard });
  setItem(DASHBOARD_CONFIG, dashboard);
}

export default store;
