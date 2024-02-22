import { useMemo } from 'react';
import BarChart, { BarChartProps } from './BarChart';
import { useLocale, useTheme, useMessages } from 'components/hooks';
import { renderDateLabels, renderStatusTooltipPopup } from 'lib/charts';

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

  const datasets = useMemo(() => {
    if (!data) return [];

    return [
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
    ];
  }, [data, colors, formatMessage, labels]);

  return (
    <BarChart
      {...props}
      datasets={datasets}
      unit={unit}
      isLoading={isLoading}
      renderXLabel={renderDateLabels(unit, locale)}
      renderTooltipPopup={renderStatusTooltipPopup(unit, locale)}
    />
  );
}

export default PageviewsChart;
