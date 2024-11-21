import { DEFAULT_TIME_UNIT, TIME_UNIT_CONFIG } from 'lib/constants';
import { TimeUnit } from 'lib/types';
import { getItem, setItem } from 'next-basics';
import { useState } from 'react';
import useStore, { setTimeUnit } from 'store/app';

const selector = (state: { timeUnit: string }) => state.timeUnit;

export function useTimeUnit() {
  const storeTimeUnit = useStore(selector) || getItem(TIME_UNIT_CONFIG) || DEFAULT_TIME_UNIT;
  const [tempTimeUnit, setTempTimeUnit] = useState<TimeUnit>(storeTimeUnit);
  const timeUnitOptions = ['hour', 'day', 'week', 'month', 'year'];

  function updateTimeUnit(value: TimeUnit) {
    setTempTimeUnit(value);
  }

  function saveTimeUnit() {
    setTimeUnit(tempTimeUnit);
    setItem(TIME_UNIT_CONFIG, tempTimeUnit);
  }

  return {
    timeUnit: tempTimeUnit,
    timeUnitOptions,
    updateTimeUnit,
    saveTimeUnit,
  };
}

export default useTimeUnit;
