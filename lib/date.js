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

  const { num, unit } = value.match(/^(?<num>[0-9]+)(?<unit>hour|day)$/).groups;

  switch (unit) {
    case 'day':
      return {
        startDate: subDays(day, num),
        endDate: day,
        unit,
      };
    case 'hour':
      return {
        startDate: subHours(hour, num),
        endDate: hour,
        unit,
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
