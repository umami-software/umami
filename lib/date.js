import moment from 'moment-timezone';
import {
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
  subHours,
  subDays,
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
} from 'date-fns';

export function getTimezone() {
  return moment.tz.guess();
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function getDateRange(value) {
  const now = new Date();

  const { num, unit } = value.match(/^(?<num>[0-9]+)(?<unit>hour|day|week|month|year)$/).groups;

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
          startDate: startOfWeek(now),
          endDate: endOfWeek(now),
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

  function findData(t) {
    const x = data.find(e => {
      return normalize(getDateFromString(e.t)).getTime() === t.getTime();
    });

    return x?.y || 0;
  }

  for (let i = 0; i < n; i++) {
    const t = normalize(add(startDate, i));
    const y = findData(t);

    arr.push({ ...data[i], t, y });
  }

  return arr;
}

export function getDateLength(startDate, endDate, unit) {
  const [diff] = dateFuncs[unit];
  return diff(endDate, startDate) + 1;
}
