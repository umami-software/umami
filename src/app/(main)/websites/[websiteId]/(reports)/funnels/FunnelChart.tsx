import { colord } from 'colord';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useFunnelChartQuery,
  useLocale,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';

// Conversion rate of the whole funnel, by when sessions entered it.
export function FunnelChart({ websiteId, id }: { websiteId: string; id: string }) {
  return <ConversionChart {...useFunnelChartQuery({ websiteId, id })} />;
}

// Converted / entered per time bucket as a line, shared by the funnel and goal views.
export function ConversionChart({
  data,
  isLoading,
  error,
}: {
  data?: Array<{ t: string; entered: number; converted: number }>;
  isLoading?: boolean;
  error?: unknown;
}) {
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();

  const chartData: any = useMemo(() => {
    if (!data) return { datasets: [] };

    const color = colord(CHART_COLORS[0]);

    return {
      datasets: [
        {
          label: t(labels.conversionRate),
          data: generateTimeSeries(
            data.map(({ t, entered, converted }) => ({
              x: t,
              y: entered ? Math.round((converted / entered) * 1000) / 10 : 0,
            })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          type: 'line',
          borderColor: color.alpha(0.8).toRgbString(),
          backgroundColor: color.alpha(0.1).toRgbString(),
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    };
  }, [data, startDate, endDate, unit, dateLocale, t, labels]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <LoadingPanel data={data} isLoading={isLoading} error={error}>
      <BarChart
        chartData={chartData}
        minDate={startDate}
        maxDate={endDate}
        unit={unit}
        renderXLabel={renderXLabel}
        renderYLabel={(label: string) => `${Math.round(Number(label))}%`}
        formatValue={(value: number) => `${value}%`}
        height="320px"
      />
    </LoadingPanel>
  );
}
