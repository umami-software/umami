import { useMemo } from 'react';
import BarChart, { BarChartProps } from 'components/charts/BarChart';
import { useLocale, useTheme, useMessages } from 'components/hooks';
import { renderDateLabels } from 'lib/charts';

export interface PageviewsChartProps extends BarChartProps {
  data: {
    pageviews: any[];
    sessions: any[];
    compare?: {
      pageviews: any[];
      sessions: any[];
    };
  };
  unit: string;
  isLoading?: boolean;
}

export function PageviewsChart({ data, unit, isLoading, ...props }: PageviewsChartProps) {
  const { formatMessage, labels } = useMessages();
  const { colors } = useTheme();
  const { locale } = useLocale();

  const chartData = useMemo(() => {
    if (!data) {
      return {};
    }

    return {
      datasets: [
        {
          label: formatMessage(labels.visitors),
          data: data.sessions,
          borderWidth: 1,
          ...colors.chart.visitors,
        },
        {
          label: formatMessage(labels.views),
          data: data.pageviews,
          borderWidth: 1,
          ...colors.chart.views,
        },
        data.compare
          ? {
              type: 'line',
              label: formatMessage(labels.visitors),
              data: data.compare.pageviews,
              borderWidth: 2,
              borderColor: '#f15bb5',
            }
          : null,
        data.compare
          ? {
              type: 'line',
              label: formatMessage(labels.visits),
              data: data.compare.sessions,
              borderWidth: 2,
              borderColor: '#9b5de5',
            }
          : null,
      ].filter(n => n),
    };
  }, [data, locale]);

  return (
    <BarChart
      {...props}
      data={chartData}
      unit={unit}
      isLoading={isLoading}
      renderXLabel={renderDateLabels(unit, locale)}
    />
  );
}

export default PageviewsChart;
