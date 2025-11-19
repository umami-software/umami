import { Grid, Column } from '@umami/react-zen';
import { useMessages, useResultQuery } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { formatLongNumber } from '@/lib/format';
import { percentFilter } from '@/lib/filters';

export interface AttributionProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  model: string;
  type: string;
  step: string;
  currency?: string;
}

export function Attribution({
  websiteId,
  startDate,
  endDate,
  model,
  type,
  step,
  currency,
}: AttributionProps) {
  const { data, error, isLoading } = useResultQuery<any>('attribution', {
    websiteId,
    startDate,
    endDate,
    model,
    type,
    step,
  });

  const { formatMessage, labels } = useMessages();

  const { pageviews, visitors, visits } = data?.total || {};

  const metrics = data
    ? [
        {
          value: visitors,
          label: formatMessage(labels.visitors),
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: formatMessage(labels.visits),
          formatValue: formatLongNumber,
        },
        {
          value: pageviews,
          label: formatMessage(labels.views),
          formatValue: formatLongNumber,
        },
      ]
    : [];

  function AttributionTable({ data = [], title }: { data: any; title: string }) {
    const attributionData = percentFilter(
      data.map(({ name, value }) => ({
        x: name,
        y: Number(value),
      })),
    );

    return (
      <ListTable
        title={title}
        metric={formatMessage(currency ? labels.revenue : labels.visitors)}
        currency={currency}
        data={attributionData.map(({ x, y, z }: { x: string; y: number; z: number }) => ({
          label: x,
          count: y,
          percent: z,
        }))}
      />
    );
  }

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      {data && (
        <Column gap>
          <MetricsBar>
            {metrics?.map(({ label, value, formatValue }) => {
              return (
                <MetricCard key={label} value={value} label={label} formatValue={formatValue} />
              );
            })}
          </MetricsBar>
          <SectionHeader title={formatMessage(labels.sources)} />
          <Grid columns={{ xs: '1fr', md: '1fr 1fr' }} gap>
            <Panel>
              <AttributionTable data={data?.['referrer']} title={formatMessage(labels.referrer)} />
            </Panel>
            <Panel>
              <AttributionTable data={data?.['paidAds']} title={formatMessage(labels.paidAds)} />
            </Panel>
          </Grid>
          <SectionHeader title="UTM" />
          <Grid columns={{ xs: '1fr', md: '1fr 1fr' }} gap>
            <Panel>
              <AttributionTable data={data?.['utm_source']} title={formatMessage(labels.sources)} />
            </Panel>
            <Panel>
              <AttributionTable data={data?.['utm_medium']} title={formatMessage(labels.medium)} />
            </Panel>
            <Panel>
              <AttributionTable
                data={data?.['utm_cmapaign']}
                title={formatMessage(labels.campaigns)}
              />
            </Panel>
            <Panel>
              <AttributionTable
                data={data?.['utm_content']}
                title={formatMessage(labels.content)}
              />
            </Panel>
            <Panel>
              <AttributionTable data={data?.['utm_term']} title={formatMessage(labels.terms)} />
            </Panel>
          </Grid>
        </Column>
      )}
    </LoadingPanel>
  );
}
