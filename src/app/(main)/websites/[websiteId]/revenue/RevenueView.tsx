import classNames from 'classnames';
import { colord } from 'colord';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { TypeIcon } from '@/components/common/TypeIcon';
import {
  useCountryNames,
  useLocale,
  useMessages,
  useRevenueQuery,
  useDateRange,
} from '@/components/hooks';
import { GridRow } from '@/components/common/GridRow';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { useCallback, useMemo } from 'react';
import { RevenueTable } from './RevenueTable';
import { Panel } from '@/components/common/Panel';
import { Column } from '@umami/react-zen';

export interface RevenueViewProps {
  websiteId: string;
  isLoading?: boolean;
}

export function RevenueView({ websiteId, isLoading }: RevenueViewProps) {
  const { formatMessage, labels } = useMessages();
  const { locale } = useLocale();
  const { countryNames } = useCountryNames(locale);

  const { data } = useRevenueQuery(websiteId);
  const currency = 'USD';
  const { dateRange } = useDateRange(websiteId);

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
    <>
      <Column gap>
        <Panel>
          <MetricsBar isFetched={!!data}>
            {metricData?.map(({ label, value, formatValue }) => {
              return (
                <MetricCard key={label} value={value} label={label} formatValue={formatValue} />
              );
            })}
          </MetricsBar>
        </Panel>
        {data && (
          <>
            <Panel>
              <BarChart
                minDate={dateRange?.startDate}
                maxDate={dateRange?.endDate}
                data={chartData}
                unit={dateRange?.unit}
                stacked={true}
                currency={currency}
                renderXLabel={renderDateLabels(dateRange?.unit, locale)}
                isLoading={isLoading}
              />
            </Panel>
            <Panel>
              <GridRow layout="two">
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
              </GridRow>
            </Panel>
          </>
        )}
        <Panel>
          <RevenueTable data={data?.table} />
        </Panel>
      </Column>
    </>
  );
}
