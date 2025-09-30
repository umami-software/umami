import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useCountryNames, useLocale, useMessages, useResultQuery } from '@/components/hooks';
import { CurrencySelect } from '@/components/input/CurrencySelect';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { Column, Grid, Row, Text } from '@umami/react-zen';
import classNames from 'classnames';
import { colord } from 'colord';
import { useCallback, useMemo, useState } from 'react';

export interface RevenueProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

export function Revenue({ websiteId, startDate, endDate, unit }: RevenueProps) {
  const [currency, setCurrency] = useState('USD');
  const { formatMessage, labels } = useMessages();
  const { locale, dateLocale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { data, error, isLoading } = useResultQuery<any>('revenue', {
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

  const chartData: any = useMemo(() => {
    if (!data) return [];

    const map = (data.chart as any[]).reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ x: t, y });

      return obj;
    }, {});

    return {
      datasets: Object.keys(map).map((key, index) => {
        const color = colord(CHART_COLORS[index % CHART_COLORS.length]);
        return {
          label: key,
          data: generateTimeSeries(map[key], startDate, endDate, unit, dateLocale),
          lineTension: 0,
          backgroundColor: color.alpha(0.6).toRgbString(),
          borderColor: color.alpha(0.7).toRgbString(),
          borderWidth: 1,
        };
      }),
    };
  }, [data, startDate, endDate, unit]);

  const metrics = useMemo(() => {
    if (!data) return [];

    const { sum, count, unique_count } = data.total;

    return [
      {
        value: sum,
        label: formatMessage(labels.total),
        formatValue: n => formatLongCurrency(n, currency),
      },
      {
        value: count ? sum / count : 0,
        label: formatMessage(labels.average),
        formatValue: n => formatLongCurrency(n, currency),
      },
      {
        value: count,
        label: formatMessage(labels.transactions),
        formatValue: formatLongNumber,
      },
      {
        value: unique_count,
        label: formatMessage(labels.uniqueCustomers),
        formatValue: formatLongNumber,
      },
    ] as any;
  }, [data, locale]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

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
              <BarChart
                chartData={chartData}
                minDate={startDate}
                maxDate={endDate}
                unit={unit}
                stacked={true}
                currency={currency}
                renderXLabel={renderXLabel}
                height="400px"
              />
            </Panel>
            <Panel>
              <ListTable
                title={formatMessage(labels.country)}
                metric={formatMessage(labels.revenue)}
                data={data?.country.map(({ name, value }: { name: string; value: number }) => ({
                  label: name,
                  count: value,
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
