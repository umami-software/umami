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
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS, CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { getItem, setItem } from '@/lib/storage';

export interface RevenueProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

export function Revenue({ websiteId, startDate, endDate, unit }: RevenueProps) {
  const [currency, setCurrency] = useState(
    getItem(CURRENCY_CONFIG) || process.env.defaultCurrency || DEFAULT_CURRENCY,
  );

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setItem(CURRENCY_CONFIG, value);
  };

  const { t, labels } = useMessages();
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
        <Text>{countryNames[code] || t(labels.unknown)}</Text>
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
        label: t(labels.total),
        formatValue: n => formatLongCurrency(n, currency),
      },
      {
        value: count ? sum / count : 0,
        label: t(labels.average),
        formatValue: n => formatLongCurrency(n, currency),
      },
      {
        value: count,
        label: t(labels.transactions),
        formatValue: formatLongNumber,
      },
      {
        value: unique_count,
        label: t(labels.uniqueCustomers),
        formatValue: formatLongNumber,
      },
    ] as any;
  }, [data, locale]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <Column gap>
      <Grid columns="280px" gap>
        <CurrencySelect value={currency} onChange={handleCurrencyChange} />
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
                title={t(labels.country)}
                metric={t(labels.revenue)}
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
