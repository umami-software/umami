import { Flexbox } from 'react-basics';
import EventDataTable from 'components/pages/event-data/EventDataTable';
import EventDataValueTable from 'components/pages/event-data/EventDataValueTable';
import { EventDataMetricsBar } from 'components/pages/event-data/EventDataMetricsBar';
import { useDateRange, useApi, usePageQuery } from 'hooks';
import styles from './WebsiteEventData.module.css';

function useData(websiteId, eventName) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['event-data:events', { websiteId, startDate, endDate, eventName }],
    () =>
      get('/event-data/events', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
        eventName,
      }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export default function WebsiteEventData({ websiteId }) {
  const {
    query: { eventName },
  } = usePageQuery();
  const { data } = useData(websiteId, eventName);

  return (
    <Flexbox className={styles.container} direction="column" gap={20}>
      <EventDataMetricsBar websiteId={websiteId} />
      {!eventName && <EventDataTable data={data} />}
      {eventName && <EventDataValueTable eventName={eventName} data={data} />}
    </Flexbox>
  );
}
