'use client';
import { Column, Grid, Row, Text } from '@umami/react-zen';
import { colord } from 'colord';
import { useCallback, useMemo, useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useLocale, useMessages, useResultQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { PerformanceCard } from '@/components/metrics/PerformanceCard';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS, WEB_VITALS_THRESHOLDS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';
import styles from './Performance.module.css';

export interface PerformanceProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

const METRICS = ['lcp', 'inp', 'cls', 'fcp', 'ttfb'] as const;

const METRIC_LABELS: Record<string, string> = {
  lcp: 'Largest Contentful Paint',
  inp: 'Interaction to Next Paint',
  cls: 'Cumulative Layout Shift',
  fcp: 'First Contentful Paint',
  ttfb: 'Time to First Byte',
};

function formatMetricValue(metric: string, value: number): string {
  if (metric === 'cls') {
    return value.toFixed(3);
  }
  return `${Math.round(value)} ms`;
}

export function Performance({ websiteId, startDate, endDate, unit }: PerformanceProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('lcp');
  const { t, labels } = useMessages();
  const { locale, dateLocale } = useLocale();

  const { data, error, isLoading } = useResultQuery<any>('performance', {
    websiteId,
    startDate,
    endDate,
    metric: selectedMetric,
  });

  const chartData: any = useMemo(() => {
    if (!data?.chart) return { datasets: [] };

    const p50Color = colord(CHART_COLORS[0]);
    const p75Color = colord(CHART_COLORS[1]);
    const p95Color = colord(CHART_COLORS[2]);

    return {
      datasets: [
        {
          label: 'p50',
          data: generateTimeSeries(
            data.chart.map((d: any) => ({ x: d.t, y: Number(d.p50) })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          type: 'line',
          borderColor: p50Color.alpha(0.8).toRgbString(),
          backgroundColor: p50Color.alpha(0.1).toRgbString(),
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'p75',
          data: generateTimeSeries(
            data.chart.map((d: any) => ({ x: d.t, y: Number(d.p75) })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          type: 'line',
          borderColor: p75Color.alpha(0.8).toRgbString(),
          backgroundColor: p75Color.alpha(0.1).toRgbString(),
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'p95',
          data: generateTimeSeries(
            data.chart.map((d: any) => ({ x: d.t, y: Number(d.p95) })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          type: 'line',
          borderColor: p95Color.alpha(0.8).toRgbString(),
          backgroundColor: p95Color.alpha(0.1).toRgbString(),
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
        },
      ],
    };
  }, [data, startDate, endDate, unit]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  const threshold = WEB_VITALS_THRESHOLDS[selectedMetric as keyof typeof WEB_VITALS_THRESHOLDS];

  return (
    <Column gap>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Column gap>
            <Grid columns={{ base: '1fr 1fr', lg: 'repeat(5, 1fr)' }} gap>
              {METRICS.map(metric => (
                <PerformanceCard
                  key={metric}
                  metric={metric}
                  value={Number(data.summary?.[metric]?.p75 || 0)}
                  label={t(labels[metric]) || metric.toUpperCase()}
                  formatValue={(n: number) => formatMetricValue(metric, n)}
                  onClick={() => setSelectedMetric(metric)}
                  selected={selectedMetric === metric}
                />
              ))}
            </Grid>
            <Panel>
              <Column gap="4" padding="4">
                <Row justifyContent="space-between" alignItems="center">
                  <Text weight="bold">{METRIC_LABELS[selectedMetric]}</Text>
                  <Row gap="4">
                    <Text size="sm" className={styles.sampleCount}>
                      {t(labels.sampleSize)}: {formatLongNumber(data.summary?.count || 0)}
                    </Text>
                  </Row>
                </Row>
                <BarChart
                  chartData={chartData}
                  minDate={startDate}
                  maxDate={endDate}
                  unit={unit}
                  renderXLabel={renderXLabel}
                  renderYLabel={(label: string) => {
                    const val = Number(label);
                    if (selectedMetric === 'cls') return val.toFixed(2);
                    return `${Math.round(val)} ms`;
                  }}
                  height="400px"
                />
              </Column>
            </Panel>
            <Panel>
              <ListTable
                title={t(labels.pages)}
                metric={t(labels[selectedMetric]) || selectedMetric.toUpperCase()}
                data={data.pages?.map(
                  ({ urlPath, p75, count }: { urlPath: string; p75: number; count: number }) => ({
                    label: urlPath,
                    count: Number(p75),
                    percent: 0,
                  }),
                )}
                renderLabel={({ label }: { label: string }) => <Text>{label}</Text>}
              />
            </Panel>
          </Column>
        )}
      </LoadingPanel>
    </Column>
  );
}
