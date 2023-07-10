import { Column, Row } from 'react-basics';
import { useApi, useDateRange } from 'hooks';
import MetricCard from 'components/metrics/MetricCard';
import useMessages from 'hooks/useMessages';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricsBar from 'components/metrics/MetricsBar';
import styles from './EventDataMetricsBar.module.css';

export function EventDataMetricsBar({ websiteId }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;

  const { data, error, isLoading, isFetched } = useQuery(
    ['event-data:fields', { websiteId, startDate, endDate, modified }],
    () =>
      get(`/event-data/fields`, {
        websiteId,
        startAt: +startDate,
        endAt: +endDate,
      }),
  );

  return (
    <Row>
      <Column defaultSize={12} xl={8}>
        <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
          {!error && isFetched && (
            <MetricCard
              className={styles.card}
              label={formatMessage(labels.fields)}
              value={data?.length}
            />
          )}
        </MetricsBar>
      </Column>
      <Column defaultSize={12} xl={4}>
        <div className={styles.actions}>
          <WebsiteDateFilter websiteId={websiteId} />
        </div>
      </Column>
    </Row>
  );
}

export default EventDataMetricsBar;
