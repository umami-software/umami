import { useSelector } from 'react-redux';
import { getDateRange } from 'lib/date';

export function useDateRange(websiteId, defaultDateRange = '7day') {
  return useSelector(
    state => state.websites[websiteId]?.dateRange || getDateRange(defaultDateRange),
  );
}
