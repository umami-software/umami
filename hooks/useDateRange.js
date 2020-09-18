import { useSelector } from 'react-redux';
import { parseISO } from 'date-fns';
import { getDateRange } from 'lib/date';
import { getItem } from 'lib/web';

export default function useDateRange(websiteId, defaultDateRange = '24hour') {
  const globalDefault = getItem('umami.date-range');
  let globalDateRange;

  if (typeof globalDefault === 'string') {
    globalDateRange = getDateRange(globalDefault);
  } else {
    globalDateRange = {
      ...globalDefault,
      startDate: parseISO(globalDefault.startDate),
      endDate: parseISO(globalDefault.endDate),
    };
  }

  return useSelector(
    state =>
      state.websites[websiteId]?.dateRange || globalDateRange || getDateRange(defaultDateRange),
  );
}
