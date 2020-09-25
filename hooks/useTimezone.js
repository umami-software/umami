import { useState, useCallback } from 'react';
import { getTimezone } from 'lib/date';
import { getItem, setItem } from 'lib/web';

export default function useTimezone() {
  const [timezone, setTimezone] = useState(getItem('umami.timezone') || getTimezone());

  const saveTimezone = useCallback(
    value => {
      setItem('umami.timezone', value);
      setTimezone(value);
    },
    [setTimezone],
  );

  return [timezone, saveTimezone];
}
