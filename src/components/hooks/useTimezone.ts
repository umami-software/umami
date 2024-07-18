import { setItem } from 'next-basics';
import { TIMEZONE_CONFIG } from 'lib/constants';
import useStore, { setTimezone } from 'store/app';

const selector = (state: { timezone: string }) => state.timezone;

export function useTimezone() {
  const timezone = useStore(selector);

  const saveTimezone = (value: string) => {
    setItem(TIMEZONE_CONFIG, value);
    setTimezone(value);
  };

  return { timezone, saveTimezone };
}

export default useTimezone;
