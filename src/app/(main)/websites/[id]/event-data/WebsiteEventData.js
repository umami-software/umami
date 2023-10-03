'use client';
import { Flexbox, Loading } from 'react-basics';
import EventDataTable from './EventDataTable';
import EventDataValueTable from './EventDataValueTable';
import { EventDataMetricsBar } from './EventDataMetricsBar';
import { useDateRange, useApi, useNavigation } from 'components/hooks';
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
  } = useNavigation();
  const { data, isLoading } = useData(websiteId, event);

  return (
    <Flexbox className={styles.container} direction="column" gap={20}>
      <EventDataMetricsBar websiteId={websiteId} />
      {!event && <EventDataTable data={data} />}
      {isLoading && <Loading position="page" />}
      {event && data && <EventDataValueTable event={event} data={data} />}
    </Flexbox>
  );
}
