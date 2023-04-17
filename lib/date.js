import moment from 'moment-timezone';
import {
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
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
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  parseISO,
} from 'date-fns';
import { getDateLocale } from 'lib/lang';

export function getTimezone() {
  return moment.tz.guess();
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function parseDateRange(value, locale = 'en-US') {
  if (typeof value === 'object') {
    const { startDate, endDate } = value;
    return {
      ...value,
      startDate: typeof startDate === 'string' ? parseISO(startDate) : startDate,
      endDate: typeof endDate === 'string' ? parseISO(endDate) : endDate,
    };
  }

  const now = new Date();
  const dateLocale = getDateLocale(locale);

  const match = value.match(/^(?<num>[0-9-]+)(?<unit>hour|day|week|month|year)$/);

  if (!match) return;

  const { num, unit } = match.groups;

  if (+num === 1) {
    switch (unit) {
      case 'day':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now),
          unit: 'hour',
          value,
        };
      case 'week':
        return {
          startDate: startOfWeek(now, { locale: dateLocale }),
          endDate: endOfWeek(now, { locale: dateLocale }),
          unit: 'day',
          value,
        };
      case 'month':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
          unit: 'day',
          value,
        };
      case 'year':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now),
          unit: 'month',
          value,
        };
    }
  }

  if (+num === -1) {
    switch (unit) {
      case 'day':
        return {
          startDate: subDays(startOfDay(now), 1),
          endDate: subDays(endOfDay(now), 1),
          unit: 'hour',
          value,
        };
      case 'week':
        return {
          startDate: subDays(startOfWeek(now, { locale: dateLocale }), 7),
          endDate: subDays(endOfWeek(now, { locale: dateLocale }), 1),
          unit: 'day',
          value,
        };
      case 'month':
        return {
          startDate: subMonths(startOfMonth(now), 1),
          endDate: subMonths(endOfMonth(now), 1),
          unit: 'day',
          value,
        };
      case 'year':
        return {
          startDate: subYears(startOfYear(now), 1),
          endDate: subYears(endOfYear(now), 1),
          unit: 'month',
          value,
        };
    }
  }

  switch (unit) {
    case 'day':
      return {
        startDate: subDays(startOfDay(now), num - 1),
        endDate: endOfDay(now),
        unit,
        value,
      };
    case 'hour':
      return {
        startDate: subHours(startOfHour(now), num - 1),
        endDate: endOfHour(now),
        unit,
        value,
      };
  }
}

export function getDateRangeValues(startDate, endDate) {
  let unit = 'year';
  if (differenceInHours(endDate, startDate) <= 48) {
    unit = 'hour';
  } else if (differenceInCalendarDays(endDate, startDate) <= 90) {
    unit = 'day';
  } else if (differenceInCalendarMonths(endDate, startDate) <= 24) {
    unit = 'month';
  }

  return { startDate: startOfDay(startDate), endDate: endOfDay(endDate), unit };
}

export function getDateFromString(str) {
  const [ymd, hms] = str.split(' ');
  const [year, month, day] = ymd.split('-');

  if (hms) {
    const [hour, min, sec] = hms.split(':');

    return new Date(year, month - 1, day, hour, min, sec);
  }

  return new Date(year, month - 1, day);
}

const dateFuncs = {
  minute: [differenceInMinutes, addMinutes, startOfMinute],
  hour: [differenceInHours, addHours, startOfHour],
  day: [differenceInCalendarDays, addDays, startOfDay],
  month: [differenceInCalendarMonths, addMonths, startOfMonth],
  year: [differenceInCalendarYears, addYears, startOfYear],
};

export function getDateArray(data, startDate, endDate, unit) {
  const arr = [];
  const [diff, add, normalize] = dateFuncs[unit];
  const n = diff(endDate, startDate) + 1;

  function findData(date) {
    const d = data.find(({ x }) => {
      return normalize(getDateFromString(x)).getTime() === date.getTime();
    });

    return d?.y || 0;
  }

  for (let i = 0; i < n; i++) {
    const t = normalize(add(startDate, i));
    const y = findData(t);

    arr.push({ x: t, y });
  }

  return arr;
}

export function getDateLength(startDate, endDate, unit) {
  const [diff] = dateFuncs[unit];
  return diff(endDate, startDate) + 1;
}

export const customFormats = {
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

export function dateFormat(date, str, locale = 'en-US') {
  return format(date, customFormats?.[locale]?.[str] || str, {
    locale: getDateLocale(locale),
  });
}
