import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { useSyncExternalStore } from 'react';
import { TIMEZONE_LEGACY } from '@/lib/constants';
import { getTimezone, isValidTimezone, normalizeTimezone } from '@/lib/date';
import { useLocale } from './useLocale';
import { useNavigation } from './useNavigation';

function canonicalizeTimezone(timezone: string): string {
  return TIMEZONE_LEGACY[timezone] ?? normalizeTimezone(timezone);
}

function subscribe() {
  return () => {};
}

function getServerTimezone() {
  return 'UTC';
}

export function useTimezone() {
  const {
    query: { timezone: queryTimezone },
  } = useNavigation();
  const localTimeZone = canonicalizeTimezone(
    useSyncExternalStore(subscribe, getTimezone, getServerTimezone),
  );
  const requestedTimezone =
    typeof queryTimezone === 'string' ? canonicalizeTimezone(queryTimezone) : undefined;
  const timezone =
    requestedTimezone && isValidTimezone(requestedTimezone) ? requestedTimezone : localTimeZone;
  const { dateLocale } = useLocale();

  const formatTimezoneDate = (date: string, pattern: string) => {
    return formatInTimeZone(
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3})?Z$/.test(date)
        ? date
        : `${date.split(' ').join('T')}Z`,
      timezone,
      pattern,
      { locale: dateLocale },
    );
  };

  const formatSeriesTimezone = (data: any, column: string, timezone: string) => {
    return data.map(item => {
      const date = new Date(item[column]);

      const format = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const parts = format.formatToParts(date);
      const get = type => parts.find(p => p.type === type)?.value;

      const year = get('year');
      const month = get('month');
      const day = get('day');
      const hour = get('hour');
      const minute = get('minute');
      const second = get('second');

      return {
        ...item,
        [column]: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
      };
    });
  };

  const toUtc = (date: Date | string | number) => {
    return fromZonedTime(date, timezone);
  };

  const fromUtc = (date: Date | string | number) => {
    return toZonedTime(date, timezone);
  };

  const localToUtc = (date: Date | string | number) => {
    return fromZonedTime(date, localTimeZone);
  };

  const localFromUtc = (date: Date | string | number) => {
    return toZonedTime(date, localTimeZone);
  };

  return {
    timezone,
    localTimeZone,
    toUtc,
    fromUtc,
    localToUtc,
    localFromUtc,
    formatTimezoneDate,
    formatSeriesTimezone,
    canonicalizeTimezone,
  };
}
