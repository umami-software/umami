import { useMessages } from 'components/hooks';
import useWebsiteSessionStats from 'components/hooks/queries/useWebsiteSessionStats';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { Flexbox } from 'react-basics';
import { type FormatNumberOptions, useIntl } from 'react-intl';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteSessionStats(websiteId);
  const intl = useIntl();

  const optionsNumber: FormatNumberOptions = { notation: 'compact', maximumSignificantDigits: 3 };
  const optionsSmallNumber: FormatNumberOptions = { notation: 'compact' };

  return (
    <Flexbox direction="row" justifyContent="space-between" style={{ minHeight: 120 }}>
      <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
        <MetricCard
          value={data?.visitors?.value}
          label={formatMessage(labels.visitors)}
          formatValue={(n: number) =>
            intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
          }
        />
        <MetricCard
          value={data?.visits?.value}
          label={formatMessage(labels.visits)}
          formatValue={(n: number) =>
            intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
          }
        />
        <MetricCard
          value={data?.pageviews?.value}
          label={formatMessage(labels.views)}
          formatValue={(n: number) =>
            intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
          }
        />
        <MetricCard
          value={data?.countries?.value}
          label={formatMessage(labels.countries)}
          formatValue={(n: number) =>
            intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
          }
        />
      </MetricsBar>
      <WebsiteDateFilter websiteId={websiteId} />
    </Flexbox>
  );
}

export default SessionsMetricsBar;
