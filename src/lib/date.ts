import {
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
  subMinutes,
  subHours,
  subDays,
  subMonths,
  subYears,
  startOfMinute,
  startOfHour,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfHour,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  differenceInMinutes,
  differenceInHours,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  max,
  min,
  isDate,
  addWeeks,
  subWeeks,
  endOfMinute,
  isSameDay,
} from 'date-fns';
import { getDateLocale } from '@/lib/lang';
import { DateRange } from '@/lib/types';

export const TIME_UNIT = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

export const CUSTOM_FORMATS = {
  'en-US': {
    p: 'ha',
    pp: 'h:mm:ss',
  },
  'fr-FR': {
    'M/d': 'd/M',
    'MMM d': 'd MMM',
    'EEE M/d': 'EEE d/M',
  },
};

const DATE_FUNCTIONS = {
  minute: {
    diff: differenceInMinutes,
    add: addMinutes,
    sub: subMinutes,
    start: startOfMinute,
    end: endOfMinute,
  },
  hour: {
    diff: differenceInHours,
    add: addHours,
    sub: subHours,
    start: startOfHour,
    end: endOfHour,
  },
  day: {
    diff: differenceInCalendarDays,
    add: addDays,
    sub: subDays,
    start: startOfDay,
    end: endOfDay,
  },
  week: {
    diff: differenceInCalendarWeeks,
    add: addWeeks,
    sub: subWeeks,
    start: startOfWeek,
    end: endOfWeek,
  },
  month: {
    diff: differenceInCalendarMonths,
    add: addMonths,
    sub: subMonths,
    start: startOfMonth,
    end: endOfMonth,
  },
  year: {
    diff: differenceInCalendarYears,
    add: addYears,
    sub: subYears,
    start: startOfYear,
    end: endOfYear,
  },
};

const TIMEZONE_MAPPINGS: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
};

export function normalizeTimezone(timezone: string): string {
  return TIMEZONE_MAPPINGS[timezone] || timezone;
}

export function isValidTimezone(timezone: string) {
  try {
    const normalizedTimezone = normalizeTimezone(timezone);
    Intl.DateTimeFormat(undefined, { timeZone: normalizedTimezone });
    return true;
  } catch (error) {
    return false;
  }
}

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function parseDateValue(value: string) {
  const match = value.match?.(/^(?<num>[0-9-]+)(?<unit>hour|day|week|month|year)$/);

  if (!match) return null;

  const { num, unit } = match.groups;

  return { num: +num, unit };
}

export function parseDateRange(value: string | object, locale = 'en-US'): DateRange {
  if (typeof value === 'object') {
    return value as DateRange;
  }

  if (value === 'all') {
    return {
      startDate: new Date(0),
      endDate: new Date(1),
      value,
    };
  }

  if (value?.startsWith?.('range')) {
    const [, startTime, endTime] = value.split(':');

    const startDate = new Date(+startTime);
    const endDate = new Date(+endTime);

    return {
      startDate,
      endDate,
      value,
      ...parseDateValue(value),
      offset: 0,
      unit: getMinimumUnit(startDate, endDate),
    };
  }

  const now = new Date();
  const dateLocale = getDateLocale(locale);
  const { num, unit } = parseDateValue(value);

  switch (unit) {
    case 'hour':
      return {
        startDate: num ? subHours(startOfHour(now), num - 1) : startOfHour(now),
        endDate: endOfHour(now),
        offset: 0,
        num: num || 1,
        unit,
        value,
      };
    case 'day':
      return {
        startDate: num ? subDays(startOfDay(now), num - 1) : startOfDay(now),
        endDate: endOfDay(now),
        unit: num ? 'day' : 'hour',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'week':
      return {
        startDate: num
          ? subWeeks(startOfWeek(now, { locale: dateLocale }), num - 1)
          : startOfWeek(now, { locale: dateLocale }),
        endDate: endOfWeek(now, { locale: dateLocale }),
        unit: 'day',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'month':
      return {
        startDate: num ? subMonths(startOfMonth(now), num - 1) : startOfMonth(now),
        endDate: endOfMonth(now),
        unit: num ? 'month' : 'day',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'year':
      return {
        startDate: num ? subYears(startOfYear(now), num - 1) : startOfYear(now),
        endDate: endOfYear(now),
        unit: 'month',
        offset: 0,
        num: num || 1,
        value,
      };
  }
}

export function getOffsetDateRange(dateRange: DateRange, increment: number) {
  const { startDate, endDate, unit, num, offset, value } = dateRange;

  const change = num * increment;
  const { add } = DATE_FUNCTIONS[unit];
  const { unit: originalUnit } = parseDateValue(value) || {};

  switch (originalUnit) {
    case 'day':
      return {
        ...dateRange,
        startDate: addDays(startDate, change),
        endDate: addDays(endDate, change),
        offset: offset + increment,
      };
    case 'week':
      return {
        ...dateRange,
        startDate: addWeeks(startDate, change),
        endDate: addWeeks(endDate, change),
        offset: offset + increment,
      };
    case 'month':
      return {
        ...dateRange,
        startDate: addMonths(startDate, change),
        endDate: addMonths(endDate, change),
        offset: offset + increment,
      };
    case 'year':
      return {
        ...dateRange,
        startDate: addYears(startDate, change),
        endDate: addYears(endDate, change),
        offset: offset + increment,
      };
    default:
      return {
        startDate: add(startDate, change),
        endDate: add(endDate, change),
        value,
        unit,
        num,
        offset: offset + increment,
      };
  }
}

export function getAllowedUnits(startDate: Date, endDate: Date) {
  const units = ['minute', 'hour', 'day', 'month', 'year'];
  const minUnit = getMinimumUnit(startDate, endDate);
  const index = units.indexOf(minUnit === 'year' ? 'month' : minUnit);

  return index >= 0 ? units.splice(index) : [];
}

export function getMinimumUnit(startDate: number | Date, endDate: number | Date) {
  if (differenceInMinutes(endDate, startDate) <= 60) {
    return 'minute';
  } else if (differenceInHours(endDate, startDate) <= 48) {
    return 'hour';
  } else if (differenceInCalendarMonths(endDate, startDate) <= 6) {
    return 'day';
  } else if (differenceInCalendarMonths(endDate, startDate) <= 24) {
    return 'month';
  }

  return 'year';
}

export function getDateArray(data: any[], startDate: Date, endDate: Date, unit: string) {
  const arr = [];
  const { diff, add, start } = DATE_FUNCTIONS[unit];
  const n = diff(endDate, startDate);

  for (let i = 0; i <= n; i++) {
    const t = start(add(startDate, i));
    const y = data.find(({ x }) => start(new Date(x)).getTime() === t.getTime())?.y || 0;

    arr.push({ x: t, y });
  }

  return arr;
}

export function formatDate(date: string | number | Date, str: string, locale = 'en-US') {
  return format(
    typeof date === 'string' ? new Date(date) : date,
    CUSTOM_FORMATS?.[locale]?.[str] || str,
    {
      locale: getDateLocale(locale),
    },
  );
}

export function maxDate(...args: Date[]) {
  return max(args.filter(n => isDate(n)));
}

export function minDate(...args: any[]) {
  return min(args.filter(n => isDate(n)));
}

export function getLocalTime(t: string | number | Date) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function getDateLength(startDate: Date, endDate: Date, unit: string | number) {
  const { diff } = DATE_FUNCTIONS[unit];
  return diff(endDate, startDate) + 1;
}

export function getCompareDate(compare: string, startDate: Date, endDate: Date) {
  if (compare === 'yoy') {
    return { startDate: subYears(startDate, 1), endDate: subYears(endDate, 1) };
  }

  const diff = differenceInMinutes(endDate, startDate);

  return { startDate: subMinutes(startDate, diff), endDate: subMinutes(endDate, diff) };
}

export function getDayOfWeekAsDate(dayOfWeek: number) {
  const startOfWeekDay = startOfWeek(new Date());
  const daysToAdd = [0, 1, 2, 3, 4, 5, 6].indexOf(dayOfWeek);
  let currentDate = addDays(startOfWeekDay, daysToAdd);

  // Ensure we're not returning a past date
  if (isSameDay(currentDate, startOfWeekDay)) {
    currentDate = addDays(currentDate, 7);
  }

  return currentDate;
}
