import { TimeUnit } from 'lib/types';
import { useState } from 'react';

export function useTimeUnit(): {
  currentTimeUnit: TimeUnit;
  timeUnitOptions: TimeUnit[];
  saveTimeUnit: (value: TimeUnit) => void;
} {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('hour');
  const timeUnitOptions = ['hour', 'day', 'week', 'month', 'year'];

  function saveTimeUnit(value: TimeUnit) {
    setTimeUnit(value);
  }

  return { currentTimeUnit: timeUnit, timeUnitOptions, saveTimeUnit };
}

export default useTimeUnit;
