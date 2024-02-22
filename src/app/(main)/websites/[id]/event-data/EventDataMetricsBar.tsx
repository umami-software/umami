import { useApi, useDateRange } from 'components/hooks';
import MetricCard from 'components/metrics/MetricCard';
import useMessages from 'components/hooks/useMessages';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricsBar from 'components/metrics/MetricsBar';
import styles from './EventDataMetricsBar.module.css';

export function EventDataMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;

  const { data, error, isLoading, isFetched } = useQuery({
    queryKey: ['event-data:stats', { websiteId, startDate, endDate, modified }],
    queryFn: () =>
      get(`/event-data/stats`, {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
      }),
  });

  return (
    <div className={styles.container}>
      <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
        <MetricCard label={formatMessage(labels.events)} value={data?.events} />
        <MetricCard label={formatMessage(labels.fields)} value={data?.fields} />
        <MetricCard label={formatMessage(labels.totalRecords)} value={data?.records} />
      </MetricsBar>
      <div className={styles.actions}>
        <WebsiteDateFilter websiteId={websiteId} />
      </div>
    </div>
  );
}

export default EventDataMetricsBar;
