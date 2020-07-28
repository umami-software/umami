import moment from 'moment-timezone';
import { addMinutes, endOfDay, subDays, subHours } from 'date-fns';

export function getTimezone() {
  const tz = moment.tz.guess();
  return moment.tz.zone(tz).abbr(new Date().getTimezoneOffset());
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}

export function getDateRange(value) {
  const now = new Date();
  const endToday = endOfDay(now);

  switch (value) {
    case '7d':
      return {
        startDate: subDays(endToday, 7),
        endDate: endToday,
        unit: 'day',
      };
    case '30d':
      return {
        startDate: subDays(endToday, 30),
        endDate: endToday,
        unit: 'day',
      };
    default:
      return {
        startDate: subHours(now, 24),
        endDate: now,
        unit: 'hour',
      };
  }
}
