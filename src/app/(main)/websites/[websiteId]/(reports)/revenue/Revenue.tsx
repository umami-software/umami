import { Column, Grid, Row, Text } from '@umami/react-zen';
import classNames from 'classnames';
import { colord } from 'colord';
import { useCallback, useMemo, useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useCountryNames, useLocale, useMessages, useResultQuery } from '@/components/hooks';
import { CurrencySelect } from '@/components/input/CurrencySelect';
import { FilterButtons } from '@/components/input/FilterButtons';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

export interface RevenueProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

type RevenueChartMetric = 'sum' | 'average' | 'count' | 'unique_count';

interface RevenueChartPoint {
  t: string;
  sum: number;
  average: number;
  count: number;
  unique_count: number;
}

interface RevenueReportData {
  chart: RevenueChartPoint[];
  country: { name: string; value: number }[];
  total: { sum: number; count: number; average: number; unique_count: number };
}

interface RevenueMetricDefinition {
  id: RevenueChartMetric;
  label: string;
  formatValue: (value: number) => string;
  isCurrency: boolean;
}

export function Revenue({ websiteId, startDate, endDate, unit }: RevenueProps) {
  const [currency, setCurrency] = useState('USD');
  const [metric, setMetric] = useState<RevenueChartMetric>('sum');
  const { formatMessage, labels } = useMessages();
  const { locale, dateLocale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { data, error, isLoading } = useResultQuery<RevenueReportData>('revenue', {
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const renderCountryName = useCallback(
    ({ label: code }) => (
      <Row className={classNames(locale)} gap>
        <TypeIcon type="country" value={code} />
        <Text>{countryNames[code] || formatMessage(labels.unknown)}</Text>
      </Row>
    ),
    [countryNames, locale],
  );

  const metricDefinitions = useMemo<RevenueMetricDefinition[]>(
    () => [
      {
        id: 'sum',
        label: formatMessage(labels.total),
        formatValue: value => formatLongCurrency(value, currency),
        isCurrency: true,
      },
      {
        id: 'average',
        label: formatMessage(labels.average),
        formatValue: value => formatLongCurrency(value, currency),
        isCurrency: true,
      },
      {
        id: 'count',
        label: formatMessage(labels.transactions),
        formatValue: formatLongNumber,
        isCurrency: false,
      },
      {
        id: 'unique_count',
        label: formatMessage(labels.uniqueCustomers),
        formatValue: formatLongNumber,
        isCurrency: false,
      },
    ],
    [formatMessage, labels, currency],
  );

  const selectedMetric = useMemo(
    () => metricDefinitions.find(({ id }) => id === metric) ?? metricDefinitions[0],
    [metricDefinitions, metric],
  );

  const chartData: any = useMemo(() => {
    if (!data) return [];

    return {
      datasets: [
        {
          label: selectedMetric.label,
          data: generateTimeSeries(
            data.chart.map((point: RevenueChartPoint) => ({
              x: point.t,
              y: Number(point[metric]),
            })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          lineTension: 0,
          backgroundColor: colord(CHART_COLORS[0]).alpha(0.6).toRgbString(),
          borderColor: colord(CHART_COLORS[0]).alpha(0.7).toRgbString(),
          borderWidth: 1,
        },
      ],
    };
  }, [data, metric, selectedMetric.label, startDate, endDate, unit, dateLocale]);

  const metrics = useMemo(() => {
    if (!data) return [];

    return metricDefinitions.map(({ id, label, formatValue }) => ({
      value: Number(data.total[id]),
      label,
      formatValue,
    })) as any;
  }, [data, metricDefinitions]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);
  const renderYLabel = useCallback(
    value => {
      if (selectedMetric.isCurrency) {
        return formatLongCurrency(Number(value), currency);
      }

      return formatLongNumber(Number(value));
    },
    [selectedMetric.isCurrency, currency],
  );

  const metricOptions = useMemo(
    () => metricDefinitions.map(({ id, label }) => ({ id, label })),
    [metricDefinitions],
  );
  const handleMetricChange = useCallback((value: string) => {
    setMetric(value as RevenueChartMetric);
  }, []);

  return (
    <Column gap>
      <Grid columns="280px" gap>
        <CurrencySelect value={currency} onChange={setCurrency} />
      </Grid>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Column gap>
            <MetricsBar>
              {metrics?.map(({ label, value, formatValue }) => {
                return (
                  <MetricCard key={label} value={value} label={label} formatValue={formatValue} />
                );
              })}
            </MetricsBar>
            <Panel>
              <FilterButtons items={metricOptions} value={metric} onChange={handleMetricChange} />
              <BarChart
                chartData={chartData}
                minDate={startDate}
                maxDate={endDate}
                unit={unit}
                stacked={false}
                currency={selectedMetric.isCurrency ? currency : undefined}
                renderXLabel={renderXLabel}
                renderYLabel={renderYLabel}
                height="400px"
              />
            </Panel>
            <Panel>
              <ListTable
                title={formatMessage(labels.country)}
                metric={formatMessage(labels.revenue)}
                data={data?.country.map(({ name, value }: { name: string; value: number }) => ({
                  label: name,
                  count: Number(value),
                  percent: (value / data?.total.sum) * 100,
                }))}
                currency={currency}
                renderLabel={renderCountryName}
              />
            </Panel>
          </Column>
        )}
      </LoadingPanel>
    </Column>
  );
}
