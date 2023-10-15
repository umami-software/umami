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
  max,
  min,
  isDate,
  subWeeks,
} from 'date-fns';
import { getDateLocale } from 'lib/lang';

export const TIME_UNIT = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

const dateFuncs = {
  minute: [differenceInMinutes, addMinutes, startOfMinute],
  hour: [differenceInHours, addHours, startOfHour],
  day: [differenceInCalendarDays, addDays, startOfDay],
  month: [differenceInCalendarMonths, addMonths, startOfMonth],
  year: [differenceInCalendarYears, addYears, startOfYear],
};

export function getTimezone() {
  return moment.tz.guess();
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function parseDateRange(value, locale = 'en-US') {
  if (typeof value === 'object') {
    return value;
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
      unit: getMinimumUnit(startDate, endDate),
      value,
    };
  }

  const now = new Date();
  const dateLocale = getDateLocale(locale);

  const match = value?.match?.(/^(?<num>[0-9-]+)(?<unit>hour|day|week|month|year)$/);

  if (!match) return null;

  const { num, unit } = match.groups;
  const selectedUnit = { num, unit };

  if (+num === 1) {
    switch (unit) {
      case 'day':
        return {
          startDate: startOfDay(now),
          endDate: endOfDay(now),
          unit: 'hour',
          value,
          selectedUnit,
        };
      case 'week':
        return {
          startDate: startOfWeek(now, { locale: dateLocale }),
          endDate: endOfWeek(now, { locale: dateLocale }),
          unit: 'day',
          value,
          selectedUnit,
        };
      case 'month':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
          unit: 'day',
          value,
          selectedUnit,
        };
      case 'year':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now),
          unit: 'month',
          value,
          selectedUnit,
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
          selectedUnit,
        };
      case 'week':
        return {
          startDate: subDays(startOfWeek(now, { locale: dateLocale }), 7),
          endDate: subDays(endOfWeek(now, { locale: dateLocale }), 1),
          unit: 'day',
          value,
          selectedUnit,
        };
      case 'month':
        return {
          startDate: subMonths(startOfMonth(now), 1),
          endDate: subMonths(endOfMonth(now), 1),
          unit: 'day',
          value,
          selectedUnit,
        };
      case 'year':
        return {
          startDate: subYears(startOfYear(now), 1),
          endDate: subYears(endOfYear(now), 1),
          unit: 'month',
          value,
          selectedUnit,
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
        selectedUnit,
      };
    case 'hour':
      return {
        startDate: subHours(startOfHour(now), num - 1),
        endDate: endOfHour(now),
        unit,
        value,
        selectedUnit,
      };
  }
}

export function incrementDateRange(value, increment) {
  const { startDate, endDate, selectedUnit } = value;

  const { num, unit } = selectedUnit;

  const sub = num * increment;

  switch (unit) {
    case 'hour':
      return {
        ...value,
        startDate: subHours(startDate, sub),
        endDate: subHours(endDate, sub),
        value: 'range',
      };
    case 'day':
      return {
        ...value,
        startDate: subDays(startDate, sub),
        endDate: subDays(endDate, sub),
        value: 'range',
      };
    case 'week':
      return {
        ...value,
        startDate: subWeeks(startDate, sub),
        endDate: subWeeks(endDate, sub),
        value: 'range',
      };
    case 'month':
      return {
        ...value,
        startDate: subMonths(startDate, sub),
        endDate: subMonths(endDate, sub),
        value: 'range',
      };
    case 'year':
      return {
        ...value,
        startDate: subYears(startDate, sub),
        endDate: subYears(endDate, sub),
        value: 'range',
      };
  }
}

export function getAllowedUnits(startDate, endDate) {
  const units = ['minute', 'hour', 'day', 'month', 'year'];
  const minUnit = getMinimumUnit(startDate, endDate);
  const index = units.indexOf(minUnit === 'year' ? 'month' : minUnit);

  return index >= 0 ? units.splice(index) : [];
}

export function getMinimumUnit(startDate, endDate) {
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

export function getDateFromString(str) {
  const [ymd, hms] = str.split(' ');
  const [year, month, day] = ymd.split('-');

  if (hms) {
    const [hour, min, sec] = hms.split(':');

    return new Date(year, month - 1, day, hour, min, sec);
  }

  return new Date(year, month - 1, day);
}

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

export function formatDate(date, str, locale = 'en-US') {
  return format(
    typeof date === 'string' ? new Date(date) : date,
    CUSTOM_FORMATS?.[locale]?.[str] || str,
    {
      locale: getDateLocale(locale),
    },
  );
}

export function maxDate(...args) {
  return max(args.filter(n => isDate(n)));
}

export function minDate(...args) {
  return min(args.filter(n => isDate(n)));
}
