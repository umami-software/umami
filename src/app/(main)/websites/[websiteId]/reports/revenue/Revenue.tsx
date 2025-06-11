import { useState } from 'react';
import { Grid, Select, ListItem } from '@umami/react-zen';
import classNames from 'classnames';
import { colord } from 'colord';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useCountryNames, useLocale, useMessages, useResultQuery } from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS, CURRENCIES } from '@/lib/constants';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { useCallback, useMemo } from 'react';
import { Panel } from '@/components/common/Panel';
import { Column } from '@umami/react-zen';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { parseDateRange } from '@/lib/date';

export interface RevenueProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
}

export function Revenue({ websiteId, startDate, endDate }: RevenueProps) {
  const [currency, setCurrency] = useState('USD');
  const [search, setSearch] = useState('');
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);
  const { unit } = parseDateRange({ startDate, endDate }, locale);
  const { data, error, isLoading } = useResultQuery<any>('revenue', {
    websiteId,
    dateRange: {
      startDate,
      endDate,
    },
    parameters: {
      currency,
    },
  });
  const isEmpty = !Object.keys(data || {})?.length;

  const renderCountryName = useCallback(
    ({ x: code }) => (
      <span className={classNames(locale)}>
        <TypeIcon type="country" value={code?.toLowerCase()} />
        {countryNames[code]}
      </span>
    ),
    [countryNames, locale],
  );

  const chartData = useMemo(() => {
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
          data: map[key],
          lineTension: 0,
          backgroundColor: color.alpha(0.6).toRgbString(),
          borderColor: color.alpha(0.7).toRgbString(),
          borderWidth: 1,
        };
      }),
    };
  }, [data]);

  const countryData = useMemo(() => {
    if (!data) return [];

    const labels = data.country.map(({ name }) => name);
    const datasets = [
      {
        data: data.country.map(({ value }) => value),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      },
    ];

    return { labels, datasets };
  }, [data]);

  const metricData = useMemo(() => {
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

  return (
    <Column gap>
      <Grid columns="280px" gap>
        <Select
          items={CURRENCIES}
          label={formatMessage(labels.currency)}
          value={currency}
          defaultValue={currency}
          onChange={setCurrency}
          listProps={{ style: { maxHeight: '300px' } }}
          onSearch={setSearch}
          allowSearch
        >
          {CURRENCIES.map(({ id, name }) => {
            if (search && !`${id}${name}`.toLowerCase().includes(search)) {
              return null;
            }

            return (
              <ListItem key={id} id={id}>
                {id} &mdash; {name}
              </ListItem>
            );
          }).filter(n => n)}
        </Select>
      </Grid>

      <LoadingPanel isEmpty={isEmpty} isLoading={isLoading} error={error}>
        <Column gap>
          <MetricsBar isFetched={!!data}>
            {metricData?.map(({ label, value, formatValue }) => {
              return (
                <MetricCard key={label} value={value} label={label} formatValue={formatValue} />
              );
            })}
          </MetricsBar>
          {data && (
            <>
              <Panel>
                <BarChart
                  minDate={startDate}
                  maxDate={endDate}
                  data={chartData}
                  unit={unit}
                  stacked={true}
                  currency={currency}
                  renderXLabel={renderDateLabels(unit, locale)}
                  isLoading={isLoading}
                />
              </Panel>
              <Panel>
                <Grid columns="1fr 1fr">
                  <ListTable
                    metric={formatMessage(labels.country)}
                    data={data?.country.map(({ name, value }) => ({
                      x: name,
                      y: Number(value),
                      z: (value / data?.total.sum) * 100,
                    }))}
                    renderLabel={renderCountryName}
                  />
                  <PieChart type="doughnut" data={countryData} />
                </Grid>
              </Panel>
            </>
          )}
        </Column>
      </LoadingPanel>
    </Column>
  );
}
