import { setItem } from 'next-basics';
import { TIMEZONE_CONFIG } from 'lib/constants';
import { formatInTimeZone } from 'date-fns-tz';
import useStore, { setTimezone } from 'store/app';

const selector = (state: { timezone: string }) => state.timezone;

export function useTimezone() {
  const timezone = useStore(selector);

  const saveTimezone = (value: string) => {
    setItem(TIMEZONE_CONFIG, value);
    setTimezone(value);
  };

  const formatDate = (date: string, pattern: string) => {
    return formatInTimeZone(date.split(' ').join('T') + 'Z', timezone, pattern);
  };

  return { timezone, saveTimezone, formatDate };
}

export default useTimezone;
