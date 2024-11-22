import { DEFAULT_TIME_UNIT, MAX_CHART_POINTS, TIME_UNIT_CONFIG, UNIT_TYPES } from 'lib/constants';
import { getDateLength } from 'lib/date';
import { DateRange, TimeUnit } from 'lib/types';
import { getItem, setItem } from 'next-basics';
import { useState } from 'react';
import useStore, { setTimeUnit } from 'store/app';

const selector = (state: { timeUnit: string }) => state.timeUnit;

export function useTimeUnit(dateRange?: DateRange) {
  const storeTimeUnit = useStore(selector) || getItem(TIME_UNIT_CONFIG) || DEFAULT_TIME_UNIT;
  const validTimeUnits = getValidTimeUnits(dateRange);
  const [tempTimeUnit, setTempTimeUnit] = useState<TimeUnit>(() => {
    return validTimeUnits.includes(storeTimeUnit) ? storeTimeUnit : validTimeUnits[0];
  });

  function getValidTimeUnits(dateRange: DateRange) {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      return UNIT_TYPES;
    }

    return UNIT_TYPES.filter(unit => {
      const points = getDateLength(dateRange.startDate, dateRange.endDate, unit);
      return points <= MAX_CHART_POINTS;
    });
  }

  function updateTimeUnit(value: TimeUnit) {
    if (validTimeUnits.includes(value)) {
      setTempTimeUnit(value);
    }
  }

  function saveTimeUnit() {
    if (validTimeUnits.includes(tempTimeUnit)) {
      setTimeUnit(tempTimeUnit);
      setItem(TIME_UNIT_CONFIG, tempTimeUnit);
    }
  }

  return {
    timeUnit: tempTimeUnit,
    timeUnitOptions: validTimeUnits,
    updateTimeUnit,
    saveTimeUnit,
  };
}

export default useTimeUnit;
