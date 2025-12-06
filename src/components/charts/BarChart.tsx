import { useTheme } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { Chart, type ChartProps } from '@/components/charts/Chart';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { useLocale } from '@/components/hooks';
import { renderNumberLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { DATE_FORMATS, formatDate } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import dayjs from 'dayjs';
import type { ManipulateType } from 'dayjs';

const dateFormats = {
  millisecond: 'T',
  second: 'pp',
  minute: 'p',
  hour: 'p - PP',
  day: 'PPPP',
  week: 'PPPP',
  month: 'LLLL yyyy',
  quarter: 'qqq',
  year: 'yyyy',
};

export interface BarChartProps extends ChartProps {
  unit?: string;
  stacked?: boolean;
  currency?: string;
  renderXLabel?: (label: string, index: number, values: any[]) => string;
  renderYLabel?: (label: string, index: number, values: any[]) => string;
  XAxisType?: string;
  YAxisType?: string;
  minDate?: Date;
  maxDate?: Date;
}

function stepByUnit(start: dayjs.Dayjs, end: dayjs.Dayjs, unit: ManipulateType) {
  const steps: dayjs.Dayjs[] = [];
  let cur = start.startOf(unit);
  const endBound = end.startOf(unit);
  while (cur.isBefore(endBound) || cur.isSame(endBound)) {
    steps.push(cur);
    cur = cur.add(1, unit);
    // safety guard
    if (steps.length > 10000) break;
  }
  return steps;
}

/**
 * Pads time-series chartData between minDate..maxDate by unit.
 * Supports common chartData shapes:
 * 1) Chart.js style: { labels: string[], datasets: [{ label, data: number[] | {x,y}[] }] }
 * 2) Series style: [{ label, data: [{ x, y }] }]
 */

function padTimeSeriesChartData(
  chartData: any,
  unit: ManipulateType,
  minDate?: Date,
  maxDate?: Date,
) {
  if (!unit || !minDate || !maxDate || !chartData) return chartData;

  const start = dayjs(minDate);
  const end = dayjs(maxDate);

  // build the canonical list of step timestamps (ISO strings)
  const steps = stepByUnit(start, end, unit);
  const stepKeys = steps.map(s => s.toISOString());

  // helper to find value by x in an array of {x,y}
  const mapArrayXY = (arr: any[]) => {
    const m = new Map<string, number>();
    arr.forEach(d => {
      if (!d) return;
      const x = d.x ? dayjs(d.x).toISOString() : d[0] ? dayjs(d[0]).toISOString() : null;
      const y =
        typeof d.y === 'number' ? d.y : Array.isArray(d) && typeof d[1] === 'number' ? d[1] : 0;
      if (x) {
        // accumulate if duplicates exist
        m.set(x, (m.get(x) || 0) + (y || 0));
      }
    });
    return m;
  };

  // Case A: Chart.js style
  if (chartData && chartData.labels && Array.isArray(chartData.datasets)) {
    // Normalize: if dataset.data is array of numbers aligned with labels -> create label->value map
    const newLabels = stepKeys.map(k => formatDate(new Date(k), DATE_FORMATS[unit], 'en')); // labels formatted; locale handled by Chart options
    const newDatasets = chartData.datasets.map((ds: any) => {
      // two subcases: ds.data is array of primitives aligning to chartData.labels OR array of {x,y}
      if (!ds || !Array.isArray(ds.data)) return { ...ds, data: Array(newLabels.length).fill(0) };

      // detect object entries
      const first = ds.data[0];
      if (first && typeof first === 'object' && ('x' in first || 'y' in first)) {
        const m = mapArrayXY(ds.data);
        const data = stepKeys.map(k => m.get(k) || 0);
        return { ...ds, data };
      }

      // otherwise assume ds.data aligns with chartData.labels
      const labelMap = new Map<string, number>();
      (chartData.labels || []).forEach((lbl: any, idx: number) => {
        const key = (lbl && new Date(lbl).toISOString()) || lbl; // try to convert label -> ISO if possible
        labelMap.set(key, ds.data[idx] ?? 0);
        // also store raw label string
        labelMap.set(String(lbl), ds.data[idx] ?? 0);
      });

      const data = stepKeys.map(k => labelMap.get(k) ?? labelMap.get(new Date(k).toString()) ?? 0);
      return { ...ds, data };
    });

    return { ...chartData, labels: newLabels, datasets: newDatasets };
  }

  // Case A2: Chart.js-style object with datasets but without labels,
  // where datasets[].data is [{ x, y }] (this is the shape EventsChart produces)
  if (chartData && Array.isArray(chartData.datasets) && !chartData.labels) {
    const newDatasets = chartData.datasets.map((ds: any) => {
      if (!ds || !Array.isArray(ds.data)) {
        // produce zero series aligned to steps
        const data = stepKeys.map(k => ({ x: k, y: 0 }));
        return { ...ds, data };
      }
      const m = mapArrayXY(ds.data);
      const data = stepKeys.map(k => ({ x: k, y: m.get(k) || 0 }));
      return { ...ds, data };
    });

    // keep any other fields (like focusLabel) intact
    return { ...chartData, datasets: newDatasets };
  }

  // Case B: Series style: array of series objects { label, data: [{ x, y }] }
  if (Array.isArray(chartData)) {
    const paddedSeries = chartData.map(series => {
      if (!series || !Array.isArray(series.data)) return { ...series, data: stepKeys.map(() => 0) };
      const m = mapArrayXY(series.data);
      // produce data array aligned with steps (each element { x: <iso>, y: <num> } or number depending on original)
      // We'll return in the { x, y } form so Chart can understand timeseries data
      const data = stepKeys.map(k => ({ x: k, y: m.get(k) || 0 }));
      return { ...series, data };
    });
    return paddedSeries;
  }

  // fallback: return original
  return chartData;
}

export function BarChart({
  chartData,
  renderXLabel,
  renderYLabel,
  unit,
  XAxisType = 'timeseries',
  YAxisType = 'linear',
  stacked = false,
  minDate,
  maxDate,
  currency,
  ...props
}: BarChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  // If this is a timeseries and we have min/max and a time unit, pad missing steps
  const paddedChartData = useMemo(() => {
    if (XAxisType === 'timeseries' && unit && minDate && maxDate) {
      return padTimeSeriesChartData(chartData, unit as ManipulateType, minDate, maxDate);
    }
    return chartData;
  }, [chartData, unit, XAxisType, minDate?.toString(), maxDate?.toString()]);

  const chartOptions: any = useMemo(() => {
    return {
      __id: Date.now(),
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
          min: formatDate(minDate, DATE_FORMATS[unit], locale),
          max: formatDate(maxDate, DATE_FORMATS[unit], locale),
          offset: true,
          time: {
            unit,
          },
          grid: {
            display: false,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            autoSkip: false,
            maxRotation: 0,
            callback: renderXLabel,
          },
        },
        y: {
          type: YAxisType,
          min: 0,
          beginAtZero: true,
          stacked: !!stacked,
          grid: {
            color: colors.chart.line,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            callback: renderYLabel || renderNumberLabels,
          },
        },
      },
    };
  }, [paddedChartData, colors, unit, stacked, renderXLabel, renderYLabel]);

  const handleTooltip = ({ tooltip }: { tooltip: any }) => {
    const { opacity, labelColors, dataPoints } = tooltip;

    setTooltip(
      opacity
        ? {
            title: formatDate(
              new Date(dataPoints[0].raw?.d || dataPoints[0].raw?.x || dataPoints[0].raw),
              dateFormats[unit],
              locale,
            ),
            color: labelColors?.[0]?.backgroundColor,
            value: currency
              ? formatLongCurrency(dataPoints[0].raw.y, currency)
              : `${formatLongNumber(dataPoints[0].raw.y)} ${dataPoints[0].dataset.label}`,
          }
        : null,
    );
  };

  return (
    <>
      <Chart
        {...props}
        type="bar"
        chartData={paddedChartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
      />
      {tooltip && <ChartTooltip {...tooltip} />}
    </>
  );
}
