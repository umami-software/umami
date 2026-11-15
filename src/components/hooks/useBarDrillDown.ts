import { useCallback } from 'react';
import { DATE_FUNCTIONS } from '@/lib/date';
import { useNavigation } from './useNavigation';

/** Returns a bar click handler that zooms the date range into the clicked bar's period. */
export function useBarDrillDown(unit: string, enabled: boolean | undefined) {
  const { router, updateParams } = useNavigation();

  const handleBarClick = useCallback(
    (date: Date) => {
      const { start, end } = DATE_FUNCTIONS[unit];

      router.push(
        updateParams({
          date: `range:${start(date).getTime()}:${end(date).getTime()}`,
          offset: undefined,
          // A kept unit could match the new range and leave a single bar.
          unit: undefined,
        }),
      );
    },
    [router, updateParams, unit],
  );

  // Hour and minute bars are already the finest view.
  return enabled && unit !== 'hour' && unit !== 'minute' ? handleBarClick : undefined;
}
