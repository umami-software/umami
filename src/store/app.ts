import { create } from 'zustand';
import {
  DATE_RANGE_CONFIG,
  DEFAULT_DATE_RANGE_VALUE,
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  DEFAULT_TIME_FORMAT,
  LOCALE_CONFIG,
  THEME_CONFIG,
  TIME_FORMAT_CONFIG,
  TIME_FORMATS,
  TIMEZONE_CONFIG,
} from '@/lib/constants';
import { getTimezone } from '@/lib/date';
import { setHour12 } from '@/lib/lang';
import { getItem } from '@/lib/storage';

const initialState = {
  locale: getItem(LOCALE_CONFIG) || process.env.defaultLocale || DEFAULT_LOCALE,
  theme: getItem(THEME_CONFIG) || DEFAULT_THEME,
  timezone: getItem(TIMEZONE_CONFIG) || getTimezone(),
  timeFormat: getItem(TIME_FORMAT_CONFIG) || DEFAULT_TIME_FORMAT,
  dateRangeValue: getItem(DATE_RANGE_CONFIG) || DEFAULT_DATE_RANGE_VALUE,
  share: null,
  shareToken: null,
  user: null,
};

const store = create(() => ({ ...initialState }));

setHour12(toHour12(initialState.timeFormat));

function toHour12(timeFormat: string) {
  return timeFormat === TIME_FORMATS.h12
    ? true
    : timeFormat === TIME_FORMATS.h24
      ? false
      : undefined;
}

export function setTimezone(timezone: string) {
  store.setState({ timezone });
}

export function setLocale(locale: string) {
  store.setState({ locale });
}

export function setTimeFormat(timeFormat: string) {
  setHour12(toHour12(timeFormat));
  store.setState({ timeFormat });
}

export function setShareData(share: object | null, shareToken: { token?: string } | null) {
  store.setState({ share, shareToken });
}

export function setUser(user: object) {
  store.setState({ user });
}

export function setDateRangeValue(dateRangeValue: string) {
  store.setState({ dateRangeValue });
}

export const useApp = store;
