import PieChart from '@/components/charts/PieChart';
import { useMessages } from '@/components/hooks';
import { Grid, GridRow } from '@/components/layout/Grid';
import ListTable from '@/components/metrics/ListTable';
import MetricCard from '@/components/metrics/MetricCard';
import MetricsBar from '@/components/metrics/MetricsBar';
import { CHART_COLORS } from '@/lib/constants';
import { formatLongNumber } from '@/lib/format';
import { useContext } from 'react';
import { ReportContext } from '../[reportId]/Report';
import styles from './AttributionView.module.css';

export interface AttributionViewProps {
  isLoading?: boolean;
}

export function AttributionView({ isLoading }: AttributionViewProps) {
  const { formatMessage, labels } = useMessages();
  const { report } = useContext(ReportContext);
  const {
    data,
    parameters: { currency },
  } = report || {};
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
    <div className={styles.container}>
      <MetricsBar isFetched={data}>
        {metrics?.map(({ label, value, formatValue }) => {
          return <MetricCard key={label} value={value} label={label} formatValue={formatValue} />;
        })}
      </MetricsBar>
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
          <div key={value} className={styles.row}>
            <div>
              <div className={styles.title}>{label}</div>
              <ListTable
                metric={formatMessage(currency ? labels.revenue : labels.visitors)}
                currency={currency}
                data={items.map(({ name, value }) => ({
                  x: name,
                  y: Number(value),
                  z: (value / total) * 100,
                }))}
              />
            </div>
            <div>
              <PieChart type="doughnut" data={chartData} isLoading={isLoading} />
            </div>
          </div>
        );
      })}
      <Grid>
        <GridRow columns="two">
          <UTMTable data={data} title={formatMessage(labels.sources)} utm={'utm_source'} />
          <UTMTable data={data} title={formatMessage(labels.medium)} utm={'utm_medium'} />
        </GridRow>
        <GridRow columns="three">
          <UTMTable data={data} title={formatMessage(labels.campaigns)} utm={'utm_campaign'} />
          <UTMTable data={data} title={formatMessage(labels.content)} utm={'utm_content'} />
          <UTMTable data={data} title={formatMessage(labels.terms)} utm={'utm_term'} />
        </GridRow>
      </Grid>
    </div>
  );
}

export default AttributionView;
