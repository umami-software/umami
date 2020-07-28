import moment from 'moment-timezone';
import { addMinutes } from 'date-fns';

export function getTimezone() {
  const tz = moment.tz.guess();
  return moment.tz.zone(tz).abbr(new Date().getTimezoneOffset());
}

export function getLocalTime(t) {
  return addMinutes(new Date(t), new Date().getTimezoneOffset());
}
