import { colord } from 'colord';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart, type BarChartProps } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useLocale,
  useTimezone,
  useWebsiteEventsSeriesQuery,
} from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { hex6 } from '@/lib/colors';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';

export interface EventsChartProps extends BarChartProps {
  websiteId: string;
  focusLabel?: string;
  limit?: number;
}

export function EventsChart({ websiteId, focusLabel, limit }: EventsChartProps) {
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone: timezone });
  const { locale, dateLocale } = useLocale();
  const { data, isLoading, error } = useWebsiteEventsSeriesQuery(websiteId, { limit });
  const [label, setLabel] = useState<string>(focusLabel);
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(() => new Set());

  const handleLegendClick = useCallback((legendLabel: string, willBeHidden: boolean) => {
    setHiddenLabels(prev => {
      const next = new Set(prev);
      if (willBeHidden) next.add(legendLabel);
      else next.delete(legendLabel);
      return next;
    });
  }, []);

  const chartData: any = useMemo(() => {
    if (!data) return;

    const map = (data as any[]).reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ x: t, y });

      return obj;
    }, {});

    if (!map || Object.keys(map).length === 0) {
      return {
        datasets: [
          {
            data: generateTimeSeries([], startDate, endDate, unit, dateLocale),
            lineTension: 0,
            borderWidth: 1,
          },
        ],
      };
    } else {
      const colorByKey: Record<string, string> = {};
      const used = new Set<string>();
      const hashOf = Object.fromEntries(
        Object.keys(map).map(key => [key, parseInt(hex6(key), 16)]),
      );
      const orderedKeys = [...Object.keys(map)].sort((a, b) => hashOf[a] - hashOf[b]);
      for (const key of orderedKeys) {
        const start = (hashOf[key] >>> 4) % CHART_COLORS.length;
        let chosen = CHART_COLORS[start];
        for (let i = 0; i < CHART_COLORS.length; i++) {
          const candidate = CHART_COLORS[(start + i) % CHART_COLORS.length];
          if (!used.has(candidate)) {
            chosen = candidate;
            break;
          }
        }
        used.add(chosen);
        colorByKey[key] = chosen;
      }

      return {
        datasets: Object.keys(map).map(key => {
          const color = colord(colorByKey[key]);
          return {
            label: key,
            data: generateTimeSeries(map[key], startDate, endDate, unit, dateLocale),
            lineTension: 0,
            backgroundColor: color.alpha(0.6).toRgbString(),
            borderColor: color.alpha(0.7).toRgbString(),
            borderWidth: 1,
          };
        }),
        focusLabel,
      };
    }
  }, [data, startDate, endDate, unit, focusLabel]);

  useEffect(() => {
    if (label !== focusLabel) {
      setLabel(focusLabel);
    }
  }, [focusLabel]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <LoadingPanel isLoading={isLoading} error={error} minHeight="400px">
      {chartData && (
        <BarChart
          chartData={chartData}
          minDate={startDate}
          maxDate={endDate}
          unit={unit}
          stacked={true}
          renderXLabel={renderXLabel}
          height="400px"
          hiddenLabels={hiddenLabels}
          onLegendClick={handleLegendClick}
        />
      )}
    </LoadingPanel>
  );
}
