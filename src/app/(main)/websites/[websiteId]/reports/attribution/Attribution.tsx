import { Grid, Column, Heading } from '@umami/react-zen';
import { useMessages, useResultQuery } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { formatLongNumber } from '@/lib/format';
import { CHART_COLORS } from '@/lib/constants';

import { PieChart } from '@/components/charts/PieChart';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';

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
    dateRange: {
      startDate,
      endDate,
    },
    parameters: {
      model,
      type,
      step,
    },
  });
  const isEmpty = !Object.keys(data || {}).length;

  const { formatMessage, labels } = useMessages();
  const ATTRIBUTION_PARAMS = [
    { value: 'referrer', label: formatMessage(labels.referrers) },
    { value: 'paidAds', label: formatMessage(labels.paidAds) },
  ];

  if (!data) {
    return null;
  }

  const { pageviews, visitors, visits } = data.total;

  const metrics = data
    ? [
        {
          value: pageviews,
          label: formatMessage(labels.views),
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: formatMessage(labels.visits),
          formatValue: formatLongNumber,
        },
        {
          value: visitors,
          label: formatMessage(labels.visitors),
          formatValue: formatLongNumber,
        },
      ]
    : [];

  function UTMTable(UTMTableProps: { data: any; title: string; utm: string }) {
    const { data, title, utm } = UTMTableProps;
    const total = data[utm].reduce((sum, { value }) => {
      return +sum + +value;
    }, 0);

    return (
      <ListTable
        title={title}
        metric={formatMessage(currency ? labels.revenue : labels.visitors)}
        currency={currency}
        data={data[utm].map(({ name, value }) => ({
          x: name,
          y: Number(value),
          z: (value / total) * 100,
        }))}
      />
    );
  }

  return (
    <LoadingPanel isEmpty={isEmpty} isLoading={isLoading} error={error}>
      <Column gap>
        <Panel>
          <MetricsBar isFetched={data}>
            {metrics?.map(({ label, value, formatValue }) => {
              return (
                <MetricCard key={label} value={value} label={label} formatValue={formatValue} />
              );
            })}
          </MetricsBar>
        </Panel>
        {ATTRIBUTION_PARAMS.map(({ value, label }) => {
          const items = data[value];
          const total = items.reduce((sum, { value }) => {
            return +sum + +value;
          }, 0);

          const chartData = {
            labels: items.map(({ name }) => name),
            datasets: [
              {
                data: items.map(({ value }) => value),
                backgroundColor: CHART_COLORS,
                borderWidth: 0,
              },
            ],
          };

          return (
            <Panel key={value}>
              <Heading>{label}</Heading>
              <Grid columns="1fr 1fr" gap>
                <ListTable
                  metric={formatMessage(currency ? labels.revenue : labels.visitors)}
                  currency={currency}
                  data={items.map(({ name, value }) => ({
                    x: name,
                    y: Number(value),
                    z: (value / total) * 100,
                  }))}
                />
                <PieChart type="doughnut" data={chartData} isLoading={isLoading} />
              </Grid>
            </Panel>
          );
        })}
        <Grid gap>
          <Grid columns="1fr 1fr" gap>
            <Panel>
              <UTMTable data={data} title={formatMessage(labels.sources)} utm={'utm_source'} />
            </Panel>
            <Panel>
              <UTMTable data={data} title={formatMessage(labels.medium)} utm={'utm_medium'} />
            </Panel>
            <Panel>
              <UTMTable data={data} title={formatMessage(labels.campaigns)} utm={'utm_campaign'} />
            </Panel>
            <Panel>
              <UTMTable data={data} title={formatMessage(labels.content)} utm={'utm_content'} />
            </Panel>
            <Panel>
              <UTMTable data={data} title={formatMessage(labels.terms)} utm={'utm_term'} />
            </Panel>
          </Grid>
        </Grid>
      </Column>
    </LoadingPanel>
  );
}
