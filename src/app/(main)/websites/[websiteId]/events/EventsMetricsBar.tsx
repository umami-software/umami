import { useMessages } from '@/components/hooks';
import useWebsiteSessionStats from '@/components/hooks/queries/useWebsiteSessionStats';
import WebsiteDateFilter from '@/components/input/WebsiteDateFilter';
import MetricCard from '@/components/metrics/MetricCard';
import MetricsBar from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { Flexbox } from 'react-basics';
import WebsiteFilterButton from '../WebsiteFilterButton';
import styles from '../WebsiteMetricsBar.module.css';

export function EventsMetricsBar({
  websiteId,
  compareMode = false,
  showFilter = false,
}: {
  websiteId: string;
  compareMode?: boolean;
  showFilter?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteSessionStats(websiteId);

  return (
    <Flexbox direction="row" justifyContent="space-between" style={{ minHeight: 120 }}>
      <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
        <MetricCard
          value={data?.visitors?.value}
          label={formatMessage(labels.visitors)}
          formatValue={formatLongNumber}
        />
        <MetricCard
          value={data?.visits?.value}
          label={formatMessage(labels.visits)}
          formatValue={formatLongNumber}
        />
        <MetricCard
          value={data?.pageviews?.value}
          label={formatMessage(labels.views)}
          formatValue={formatLongNumber}
        />
        <MetricCard
          value={data?.events?.value}
          label={formatMessage(labels.events)}
          formatValue={formatLongNumber}
        />
      </MetricsBar>
      <div className={styles.actions}>
        {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <WebsiteDateFilter websiteId={websiteId} showAllTime={!compareMode} />
      </div>
    </Flexbox>
  );
}

export default EventsMetricsBar;
