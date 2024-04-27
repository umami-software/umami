import { useMemo } from 'react';
import BarChart, { BarChartProps } from 'components/charts/BarChart';
import { useLocale, useTheme, useMessages } from 'components/hooks';
import { renderDateLabels } from 'lib/charts';

export interface PageviewsChartProps extends BarChartProps {
  data: {
    sessions: any[];
    pageviews: any[];
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
