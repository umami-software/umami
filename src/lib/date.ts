import moment from 'moment-timezone';
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
} from 'date-fns';
import { getDateLocale } from 'lib/lang';
import { DateRange } from 'lib/types';

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

export function getTimezone() {
  return moment.tz.guess();
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

  if (num === 1) {
    switch (unit) {
      case 'day':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now),
          unit: 'hour',
          num: +num,
          offset: 0,
          value,
        };
      case 'week':
        return {
          startDate: startOfWeek(now, { locale: dateLocale }),
          endDate: endOfWeek(now, { locale: dateLocale }),
          unit: 'day',
          num: +num,
          offset: 0,
          value,
        };
      case 'month':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
          unit: 'day',
          num: +num,
          offset: 0,
          value,
        };
      case 'year':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now),
          unit: 'month',
          num: +num,
          offset: 0,
          value,
        };
    }
  }

  if (num === -1) {
    switch (unit) {
      case 'day':
        return {
          startDate: subDays(startOfDay(now), 1),
          endDate: subDays(endOfDay(now), 1),
          unit: 'hour',
          num: +num,
          offset: 0,
          value,
        };
      case 'week':
        return {
          startDate: subDays(startOfWeek(now, { locale: dateLocale }), 7),
          endDate: subDays(endOfWeek(now, { locale: dateLocale }), 1),
          unit: 'day',
          num: +num,
          offset: 0,
          value,
        };
      case 'month':
        return {
          startDate: subMonths(startOfMonth(now), 1),
          endDate: subMonths(endOfMonth(now), 1),
          unit: 'day',
          num: +num,
          offset: 0,
          value,
        };
      case 'year':
        return {
          startDate: subYears(startOfYear(now), 1),
          endDate: subYears(endOfYear(now), 1),
          unit: 'month',
          num: +num,
          offset: 0,
          value,
        };
    }
  }

  switch (unit) {
    case 'day':
      return {
        startDate: subDays(startOfDay(now), +num - 1),
        endDate: endOfDay(now),
        num: +num,
        offset: 0,
        unit,
        value,
      };
    case 'hour':
      return {
        startDate: subHours(startOfHour(now), +num - 1),
        endDate: endOfHour(now),
        num: +num,
        offset: 0,
        unit,
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
    case 'week':
      return {
        ...dateRange,
        startDate: addWeeks(startDate, increment),
        endDate: addWeeks(endDate, increment),
        offset: offset + increment,
      };
    case 'month':
      return {
        ...dateRange,
        startDate: addMonths(startDate, increment),
        endDate: addMonths(endDate, increment),
        offset: offset + increment,
      };
    case 'year':
      return {
        ...dateRange,
        startDate: addYears(startDate, increment),
        endDate: addYears(endDate, increment),
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
  } else if (differenceInCalendarMonths(endDate, startDate) <= 12) {
    return 'day';
  } else if (differenceInCalendarMonths(endDate, startDate) <= 24) {
    return 'month';
  }

  return 'year';
}

export function getDateFromString(str: string) {
  const [ymd, hms] = str.split(' ');
  const [year, month, day] = ymd.split('-');

  if (hms) {
    const [hour, min, sec] = hms.split(':');

    return new Date(+year, +month - 1, +day, +hour, +min, +sec);
  }

  return new Date(+year, +month - 1, +day);
}

export function getDateArray(data: any[], startDate: Date, endDate: Date, unit: string) {
  const arr = [];
  const { diff, add, start } = DATE_FUNCTIONS[unit];
  const n = diff(endDate, startDate) + 1;

  function findData(date: Date) {
    const d = data.find(({ x }) => {
      return start(getDateFromString(x)).getTime() === date.getTime();
    });

    return d?.y || 0;
  }

  for (let i = 0; i < n; i++) {
    const t = start(add(startDate, i));
    const y = findData(t);

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
