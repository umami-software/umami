import { useSelector } from 'react-redux';
import { parseISO } from 'date-fns';
import { getDateRange } from 'lib/date';
import { getItem } from 'lib/web';

export default function useDateRange(websiteId, defaultDateRange = '24hour') {
  const globalDefault = getItem('umami.date-range');

  if (globalDefault) {
    globalDefault.startDate = parseISO(globalDefault.startDate);
    globalDefault.endDate = parseISO(globalDefault.endDate);
  }

  return useSelector(
    state =>
      state.websites[websiteId]?.dateRange || globalDefault || getDateRange(defaultDateRange),
  );
}
