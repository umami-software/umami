import { useMessages } from 'components/hooks';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime } from 'lib/format';
import { type FormatNumberOptions, useIntl } from 'react-intl';

export function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

  const optionsNumber: FormatNumberOptions = { notation: 'compact', maximumSignificantDigits: 3 };
  const optionsSmallNumber: FormatNumberOptions = { notation: 'compact' };

  return (
    <MetricsBar isFetched={true}>
      <MetricCard
        label={formatMessage(labels.visits)}
        value={data?.visits}
        formatValue={(n: number) =>
          intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
        }
      />
      <MetricCard
        label={formatMessage(labels.views)}
        value={data?.views}
        formatValue={(n: number) =>
          intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
        }
      />
      <MetricCard
        label={formatMessage(labels.events)}
        value={data?.events}
        formatValue={(n: number) =>
          intl.formatNumber(+n, +n < 100 ? optionsSmallNumber : optionsNumber)
        }
      />
      <MetricCard
        label={formatMessage(labels.visitDuration)}
        value={data?.totaltime / data?.visits}
        formatValue={n => `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`}
      />
    </MetricsBar>
  );
}
