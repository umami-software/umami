import { create } from 'zustand';
import {
  DATE_RANGE_CONFIG,
  DEFAULT_DATE_RANGE_VALUE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_CONFIG,
  THEME_CONFIG,
  TIMEZONE_CONFIG,
} from '@/lib/constants';
import { getTimezone } from '@/lib/date';
import { getItem, setItem } from '@/lib/storage';

export interface AppState {
  locale: string;
  theme: string;
  timezone: string;
  dateRangeValue: string | object;
  boardDateRanges: Record<string, string | object>;
  share: object | null;
  shareToken: { token?: string } | null;
  user: object | null;
  config: object | null;
}

const initialState: AppState = {
  locale: getItem(LOCALE_CONFIG) || process.env.defaultLocale || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
  timezone: getItem(TIMEZONE_CONFIG) || getTimezone(),
  dateRangeValue: getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE,
  boardDateRanges: {},
  share: null,
  shareToken: null,
  user: null,
  config: null,
};

const store = create<AppState>(() => ({ ...initialState }));

export function setTimezone(timezone: string) {
  store.setState({ timezone });
}

export function setLocale(locale: string) {
  store.setState({ locale });
}

export function setShareData(
  share: object | null,
  shareToken: { token?: string } | null,
) {
  store.setState({ share, shareToken });
}

export function setUser(user: object) {
  store.setState({ user });
}

export function setConfig(config: object) {
  store.setState({ config });
}

export function setDateRangeValue(dateRangeValue: string | object) {
  store.setState({ dateRangeValue });
}

// Scoped board setter to handle unique board filter persistence without overwriting global defaults
export function setBoardDateRangeValue(dateRangeValue: string | object, boardId: string) {
  if (boardId) {
    store.setState(state => ({
      dateRangeValue,
      boardDateRanges: {
        ...state.boardDateRanges,
        [boardId]: dateRangeValue,
      },
    }));
    setItem(`${DATE_RANGE_CONFIG}:${boardId}`, dateRangeValue);
  } else {
    store.setState({ dateRangeValue });
  }
}

export const useApp = store;