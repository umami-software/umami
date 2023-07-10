import EventDataTable from 'components/pages/event-data/EventDataTable';
import { EventDataMetricsBar } from 'components/pages/event-data/EventDataMetricsBar';
import { useDateRange, useApi, usePageQuery } from 'hooks';
import styles from './WebsiteEventData.module.css';

function useFields(websiteId, field) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate } = dateRange;
  const { get, useQuery } = useApi();
  const { data, error, isLoading } = useQuery(
    ['event-data:fields', websiteId, startDate, endDate],
    () =>
      get('/event-data', {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
        field,
      }),
    { enabled: !!(websiteId && startDate && endDate) },
  );

  return { data, error, isLoading };
}

export default function WebsiteEventData({ websiteId }) {
  const { data } = useFields(websiteId);
  const { query } = usePageQuery();

  return (
    <div className={styles.container}>
      <EventDataMetricsBar websiteId={websiteId} />
      <EventDataTable data={data} showValue={query?.field} />
    </div>
  );
}
