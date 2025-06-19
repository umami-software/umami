import { useCallback, useMemo } from 'react';
import { useTheme } from '@umami/react-zen';
import { BarChart, BarChartProps } from '@/components/charts/BarChart';
import { useLocale, useMessages } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { formatDateByUnit } from '@/lib/date';

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
}

export function PageviewsChart({ data, unit, ...props }: PageviewsChartProps) {
  const { formatMessage, labels } = useMessages();
  const { theme } = useTheme();
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const chartData: any = useMemo(() => {
    if (!data) return;

    return {
      __id: new Date().getTime(),
      datasets: [
        {
          label: formatMessage(labels.visitors),
          data: convertDataset(data.sessions, unit, dateLocale),
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
          order: 3,
        },
        {
          label: formatMessage(labels.views),
          data: convertDataset(data.pageviews, unit, dateLocale),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          borderWidth: 1,
          ...colors.chart.views,
          order: 4,
        },
        ...(data.compare
          ? [
              {
                type: 'line',
                label: `${formatMessage(labels.views)} (${formatMessage(labels.previous)})`,
                data: data.compare.pageviews,
                borderWidth: 2,
                backgroundColor: '#8601B0',
                borderColor: '#8601B0',
                order: 1,
              },
              {
                type: 'line',
                label: `${formatMessage(labels.visitors)} (${formatMessage(labels.previous)})`,
                data: data.compare.sessions,
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

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <BarChart
      {...props}
      chartData={chartData}
      unit={unit}
      renderXLabel={renderXLabel}
      height="400px"
    />
  );
}

function convertDataset(data: { x: string; y: number }[], unit: string, locale?: any) {
  return data.map(d => ({ ...d, x: formatDateByUnit(d.x, unit, locale) }));
}
