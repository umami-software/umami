import { parseISO } from 'date-fns';
import { DATE_RANGE_CONFIG, DEFAULT_DATE_RANGE } from 'lib/constants';
import { getDateRange } from 'lib/date';
import { getItem, setItem } from 'lib/web';
import { useDispatch, useSelector } from 'react-redux';
import { setDateRange } from '../redux/actions/websites';
import useForceUpdate from './useForceUpdate';
import useLocale from './useLocale';

export default function useDateRange(websiteId, defaultDateRange = DEFAULT_DATE_RANGE, createdAt) {
  const dispatch = useDispatch();
  const { locale } = useLocale();
  const dateRange = useSelector(state => state.websites[websiteId]?.dateRange);
  const forceUpdate = useForceUpdate();

  const globalDefault = getItem(DATE_RANGE_CONFIG);
  let globalDateRange;

  if (globalDefault) {
    if (typeof globalDefault === 'string') {
      globalDateRange = getDateRange(globalDefault, locale, createdAt);
    } else if (typeof globalDefault === 'object') {
      globalDateRange = {
        ...globalDefault,
        startDate: parseISO(globalDefault.startDate),
        endDate: parseISO(globalDefault.endDate),
      };
    }
  }

  function saveDateRange(values) {
    const { value } = values;

    if (websiteId) {
      dispatch(setDateRange(websiteId, values));
    } else {
      setItem(DATE_RANGE_CONFIG, value === 'custom' ? values : value);
      forceUpdate();
    }
  }

  return [
    dateRange || globalDateRange || getDateRange(defaultDateRange, locale, createdAt),
    saveDateRange,
  ];
}
