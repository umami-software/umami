import { useMemo } from 'react';
import BarChart, { BarChartProps } from 'components/charts/BarChart';
import { useLocale, useTheme, useMessages } from 'components/hooks';
import { renderDateLabels } from 'lib/charts';

export interface PageviewsChartProps extends BarChartProps {
  data: {
    views: any[];
    visitors: any[];
    compare?: {
      views: any[];
      visitors: any[];
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
          data: data.visitors,
          borderWidth: 1,
          ...colors.chart.visitors,
          order: 3,
        },
        {
          label: formatMessage(labels.views),
          data: data.views,
          borderWidth: 1,
          ...colors.chart.views,
          order: 4,
        },
        ...(data.compare
          ? [
              {
                type: 'line',
                label: `${formatMessage(labels.views)} (${formatMessage(labels.previous)})`,
                data: data.compare.views,
                borderWidth: 2,
                backgroundColor: '#8601B0',
                borderColor: '#8601B0',
                order: 1,
              },
              {
                type: 'line',
                label: `${formatMessage(labels.visitors)} (${formatMessage(labels.previous)})`,
                data: data.compare.visitors,
                borderWidth: 2,
                backgroundColor: '#f15bb5',
                borderColor: '#f15bb5',
                order: 2,
              },
            ]
          : []),
      ],
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
