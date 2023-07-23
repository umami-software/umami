import { Flexbox } from 'react-basics';
import EventDataTable from 'components/pages/event-data/EventDataTable';
import EventDataValueTable from 'components/pages/event-data/EventDataValueTable';
import { EventDataMetricsBar } from 'components/pages/event-data/EventDataMetricsBar';
import { useDateRange, useApi, usePageQuery } from 'hooks';
import styles from './WebsiteEventData.module.css';

function useData(websiteId, event) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['event-data:events', { websiteId, startDate, endDate, event }],
    () =>
      get('/event-data/events', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
        event,
      }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export default function WebsiteEventData({ websiteId }) {
  const {
    query: { event },
  } = usePageQuery();
  const { data } = useData(websiteId, event);

  return (
    <Flexbox className={styles.container} direction="column" gap={20}>
      <EventDataMetricsBar websiteId={websiteId} />
      {!event && <EventDataTable data={data} />}
      {event && <EventDataValueTable event={event} data={data} />}
    </Flexbox>
  );
}
