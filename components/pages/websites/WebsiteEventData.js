import { Flexbox } from 'react-basics';
import EventDataTable from 'components/pages/event-data/EventDataTable';
import EventDataValueTable from 'components/pages/event-data/EventDataValueTable';
import { EventDataMetricsBar } from 'components/pages/event-data/EventDataMetricsBar';
import { useDateRange, useApi, usePageQuery } from 'hooks';
import styles from './WebsiteEventData.module.css';

function useFields(websiteId, field, event) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['event-data:fields', { websiteId, startDate, endDate, field }],
    () =>
      get('/event-data/fields', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
        field,
        withEventNames: true,
      }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export default function WebsiteEventData({ websiteId }) {
  const {
    query: { view, event },
  } = usePageQuery();
  const { data } = useFields(websiteId, view, event);

  return (
    <Flexbox className={styles.container} direction="column" gap={20}>
      <EventDataMetricsBar websiteId={websiteId} />
      {!view && <EventDataTable data={data} />}
      {view && <EventDataValueTable field={view} event={event} data={data} />}
    </Flexbox>
  );
}
