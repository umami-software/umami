import { useState, useCallback } from 'react';
import { getTimezone } from 'lib/date';
import { getItem, setItem } from 'lib/web';
import { TIMEZONE_CONFIG } from 'lib/constants';

export default function useTimezone() {
  const [timezone, setTimezone] = useState(getItem(TIMEZONE_CONFIG) || getTimezone());

  const saveTimezone = useCallback(
    value => {
      setItem(TIMEZONE_CONFIG, value);
      setTimezone(value);
    },
    [setTimezone],
  );

  return [timezone, saveTimezone];
}
