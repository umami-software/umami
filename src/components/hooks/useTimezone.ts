import { setItem } from 'next-basics';
import { TIMEZONE_CONFIG } from 'lib/constants';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import type { FormatDateOptions, IntlShape } from 'react-intl';
import useStore, { setTimezone } from 'store/app';

const selector = (state: { timezone: string }) => state.timezone;

export function useTimezone() {
  const timezone = useStore(selector);

  const saveTimezone = (value: string) => {
    setItem(TIMEZONE_CONFIG, value);
    setTimezone(value);
  };

  const formatTimezoneDate = (intl: IntlShape, date: string, options?: FormatDateOptions) => {
    options.timeZone = timezone;
    return intl.formatDate(date, options);
  };

  const toUtc = (date: Date | string | number) => {
    return zonedTimeToUtc(date, timezone);
  };

  const fromUtc = (date: Date | string | number) => {
    return utcToZonedTime(date, timezone);
  };

  return { timezone, saveTimezone, formatTimezoneDate, toUtc, fromUtc };
}

export default useTimezone;
