import { useMessages } from 'components/hooks';
import useWebsiteSessionStats from 'components/hooks/queries/useWebsiteSessionStats';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';
import { Flexbox } from 'react-basics';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteSessionStats(websiteId);
  const intl = useIntl();

  return (
    <Flexbox direction="row" justifyContent="space-between" style={{ minHeight: 120 }}>
      <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
        <MetricCard
          value={data?.visitors?.value}
          label={formatMessage(labels.visitors)}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          value={data?.visits?.value}
          label={formatMessage(labels.visits)}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          value={data?.pageviews?.value}
          label={formatMessage(labels.views)}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          value={data?.countries?.value}
          label={formatMessage(labels.countries)}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
      </MetricsBar>
      <WebsiteDateFilter websiteId={websiteId} />
    </Flexbox>
  );
}

export default SessionsMetricsBar;
