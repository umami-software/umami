import { getDateLocale } from '@/lib/lang';
import { DateRange } from '@/lib/types';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isBefore,
  isDate,
  isEqual,
  isSameDay,
  max,
  min,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export const TIME_UNIT = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

export const DATE_FUNCTIONS = {
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

export const DATE_FORMATS = {
  minute: 'yyyy-MM-dd HH:mm',
  hour: 'yyyy-MM-dd HH',
  day: 'yyyy-MM-dd',
  week: "yyyy-'W'II",
  month: 'yyyy-MM',
  year: 'yyyy',
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
  } catch {
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

export function parseDateRange(value: string, locale = 'en-US', timezone?: string): DateRange {
  if (typeof value !== 'string') {
    return null;
  }

  if (value.startsWith('range')) {
    const [, startTime, endTime] = value.split(':');

    const startDate = new Date(+startTime);
    const endDate = new Date(+endTime);
    const unit = getMinimumUnit(startDate, endDate);

    return {
      startDate,
      endDate,
      value,
      ...parseDateValue(value),
      unit,
    };
  }

  const date = new Date();
  const now = timezone ? utcToZonedTime(date, timezone) : date;
  const dateLocale = getDateLocale(locale);
  const { num = 1, unit } = parseDateValue(value);

  switch (unit) {
    case 'hour':
      return {
        startDate: num ? subHours(startOfHour(now), num) : startOfHour(now),
        endDate: endOfHour(now),
        offset: 0,
        num: num || 1,
        unit,
        value,
      };
    case 'day':
      return {
        startDate: num ? subDays(startOfDay(now), num) : startOfDay(now),
        endDate: endOfDay(now),
        unit: num ? 'day' : 'hour',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'week':
      return {
        startDate: num
          ? subWeeks(startOfWeek(now, { locale: dateLocale }), num)
          : startOfWeek(now, { locale: dateLocale }),
        endDate: endOfWeek(now, { locale: dateLocale }),
        unit: 'day',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'month':
      return {
        startDate: num ? subMonths(startOfMonth(now), num) : startOfMonth(now),
        endDate: endOfMonth(now),
        unit: num ? 'month' : 'day',
        offset: 0,
        num: num || 1,
        value,
      };
    case 'year':
      return {
        startDate: num ? subYears(startOfYear(now), num) : startOfYear(now),
        endDate: endOfYear(now),
        unit: 'month',
        offset: 0,
        num: num || 1,
        value,
      };
  }
}

export function getOffsetDateRange(dateRange: DateRange, offset: number) {
  if (offset === 0) {
    return dateRange;
  }

  const { startDate, endDate, unit, num, value } = dateRange;

  const change = num * offset;
  const { add } = DATE_FUNCTIONS[unit];
  const { unit: originalUnit } = parseDateValue(value) || {};

  switch (originalUnit) {
    case 'day':
      return {
        ...dateRange,
        offset,
        startDate: addDays(startDate, change),
        endDate: addDays(endDate, change),
      };
    case 'week':
      return {
        ...dateRange,
        offset,
        startDate: addWeeks(startDate, change),
        endDate: addWeeks(endDate, change),
      };
    case 'month':
      return {
        ...dateRange,
        offset,
        startDate: addMonths(startDate, change),
        endDate: addMonths(endDate, change),
      };
    case 'year':
      return {
        ...dateRange,
        offset,
        startDate: addYears(startDate, change),
        endDate: addYears(endDate, change),
      };
    default:
      return {
        startDate: add(startDate, change),
        endDate: add(endDate, change),
        offset,
        value,
        unit,
        num,
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

export function maxDate(...args: Date[]) {
  return max(args.filter(n => isDate(n)));
}

export function minDate(...args: any[]) {
  return min(args.filter(n => isDate(n)));
}

export function getCompareDate(compare: string, startDate: Date, endDate: Date) {
  if (compare === 'yoy') {
    return { compare, startDate: subYears(startDate, 1), endDate: subYears(endDate, 1) };
  }

  if (compare === 'prev') {
    const diff = differenceInMinutes(endDate, startDate);

    return { compare, startDate: subMinutes(startDate, diff), endDate: subMinutes(endDate, diff) };
  }

  return {};
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

export function formatDate(
  date: string | number | Date,
  dateFormat: string = 'PPpp',
  locale = 'en-US',
) {
  return format(typeof date === 'string' ? new Date(date) : date, dateFormat, {
    locale: getDateLocale(locale),
  });
}

export function generateTimeSeries(
  data: { x: string; y: number; d?: string }[],
  minDate: Date,
  maxDate: Date,
  unit: string,
  locale: string,
) {
  const add = DATE_FUNCTIONS[unit].add;
  const start = DATE_FUNCTIONS[unit].start;
  const fmt = DATE_FORMATS[unit];

  let current = start(minDate);
  const end = start(maxDate);

  const timeseries: string[] = [];

  while (isBefore(current, end) || isEqual(current, end)) {
    timeseries.push(formatDate(current, fmt, locale));
    current = add(current, 1);
  }

  const lookup = new Map(data.map(({ x, y, d }) => [formatDate(x, fmt, locale), { x, y, d }]));

  return timeseries.map(t => {
    const { x, y, d } = lookup.get(t) || {};

    return { x: t, d: d ?? x, y: y ?? null };
  });
}

export function getDateRangeValue(startDate: Date, endDate: Date) {
  return `range:${startDate.getTime()}:${endDate.getTime()}`;
}

export function getMonthDateRangeValue(date: Date) {
  return getDateRangeValue(startOfMonth(date), endOfMonth(date));
}

export function isInvalidDate(date: any) {
  return date instanceof Date && isNaN(date.getTime());
}
