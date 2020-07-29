import moment from 'moment-timezone';
import {
  addMinutes,
  addHours,
  startOfDay,
  endOfHour,
  endOfDay,
  startOfHour,
  addDays,
  subDays,
  subHours,
  differenceInHours,
  differenceInDays,
} from 'date-fns';

export function getTimezone() {
  return moment.tz.guess();
}

export function getTimezonAbbr() {
  return moment.tz.zone(getTimezone()).abbr(new Date().getTimezoneOffset());
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function getDateRange(value) {
  const now = new Date();
  const hour = endOfHour(now);
  const day = endOfDay(now);

  switch (value) {
    case '7d':
      return {
        startDate: subDays(day, 7),
        endDate: day,
        unit: 'day',
      };
    case '30d':
      return {
        startDate: subDays(day, 30),
        endDate: day,
        unit: 'day',
      };
    default:
      return {
        startDate: subHours(hour, 24),
        endDate: hour,
        unit: 'hour',
      };
  }
}

const dateFuncs = {
  hour: [differenceInHours, addHours, startOfHour],
  day: [differenceInDays, addDays, startOfDay],
};

export function getDateArray(data, startDate, endDate, unit) {
  const arr = [];
  const [diff, add, normalize] = dateFuncs[unit];
  const n = diff(endDate, startDate);

  function findData(t) {
    return data.find(e => getLocalTime(e.t).getTime() === normalize(t).getTime())?.y || 0;
  }

  for (let i = 0; i < n; i++) {
    const t = add(startDate, i + 1);
    const y = findData(t);

    arr.push({ t, y });
  }

  return arr;
}
