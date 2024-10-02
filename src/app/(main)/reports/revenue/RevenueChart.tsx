import BarChart, { BarChartProps } from 'components/charts/BarChart';
import { useLocale, useMessages } from 'components/hooks';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { renderDateLabels } from 'lib/charts';
import { formatLongNumber } from 'lib/format';
import { useContext, useMemo } from 'react';
import { ReportContext } from '../[reportId]/Report';

export interface PageviewsChartProps extends BarChartProps {
  isLoading?: boolean;
}

export function RevenueChart({ isLoading, ...props }: PageviewsChartProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { report } = useContext(ReportContext);
  const { data, parameters } = report || {};

  const chartData = useMemo(() => {
    if (!data) {
      return {};
    }

    return {
      datasets: [
        {
          label: formatMessage(labels.average),
          data: data?.chart.map(a => ({ x: a.time, y: a.avg })),
          borderWidth: 2,
          backgroundColor: '#8601B0',
          borderColor: '#8601B0',
          order: 1,
        },
        {
          label: formatMessage(labels.total),
          data: data?.chart.map(a => ({ x: a.time, y: a.sum })),
          borderWidth: 2,
          backgroundColor: '#f15bb5',
          borderColor: '#f15bb5',
          order: 2,
        },
      ],
    };
  }, [data, locale]);

  const metricData = useMemo(() => {
    if (!data) {
      return [];
    }

    const { sum, avg, count, uniqueCount } = data.total;

    return [
      {
        value: sum,
        label: formatMessage(labels.total),
        formatValue: formatLongNumber,
      },
      {
        value: avg,
        label: formatMessage(labels.average),
        formatValue: formatLongNumber,
      },
      {
        value: count,
        label: formatMessage(labels.transactions),
        formatValue: formatLongNumber,
      },
      {
        value: uniqueCount,
        label: formatMessage(labels.uniqueCustomers),
        formatValue: formatLongNumber,
      },
    ] as any;
  }, [data, locale]);

  return (
    <>
      <MetricsBar isFetched={data}>
        {metricData?.map(({ label, value, formatValue }) => {
          return <MetricCard key={label} value={value} label={label} formatValue={formatValue} />;
        })}
      </MetricsBar>
      {data && (
        <BarChart
          {...props}
          data={chartData}
          unit={parameters?.dateRange.unit}
          isLoading={isLoading}
          renderXLabel={renderDateLabels(parameters?.dateRange.unit, locale)}
        />
      )}
    </>
  );
}

export default RevenueChart;
