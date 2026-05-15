import { Column, Grid, Heading, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  useDateRange,
  useMessages,
  useNavigation,
  useResultQuery,
  useRevenueSessionsQuery,
} from '@/components/hooks';
import { CurrencySelect } from '@/components/input/CurrencySelect';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricLabel } from '@/components/metrics/MetricLabel';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { RevenueChart } from '@/components/metrics/RevenueChart';
import { CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';
import { getItem, setItem } from '@/lib/storage';
import { SessionModal } from '../../sessions/SessionModal';
import { SessionsTable } from '../../sessions/SessionsTable';

function RevenueSessionsDataTable({
  websiteId,
  currency,
}: {
  websiteId: string;
  currency: string;
}) {
  const { updateParams } = useNavigation();
  const queryResult = useRevenueSessionsQuery(websiteId, currency);

  return (
    <DataGrid query={queryResult} allowPaging allowSearch>
      {({ data }) => (
        <SessionsTable
          data={data}
          websiteId={websiteId}
          getSessionHref={row => updateParams({ session: row.id })}
        />
      )}
    </DataGrid>
  );
}

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
  const { compare, isAllTime } = useDateRange();
  const { data, error, isLoading } = useResultQuery<any>('revenue', {
    websiteId,
    startDate,
    endDate,
    currency,
    compare,
  });

  const metrics = useMemo(() => {
    if (!data) return [];

    const { sum, count, average, unique_count, arpu, comparison } = data.total;

    return [
      {
        value: sum,
        label: t(labels.total),
        change: comparison ? sum - comparison.sum : 0,
        formatValue: (n: number) => formatLongCurrency(n, currency),
      },
      {
        value: average,
        label: t(labels.aov),
        tooltip: (
          <>
            <div>Average Order Value</div>
            <div>(Total Revenue / Orders)</div>
          </>
        ),
        change: comparison ? average - comparison.average : 0,
        formatValue: (n: number) => formatLongCurrency(n, currency),
      },
      {
        value: arpu,
        label: t(labels.arpu),
        tooltip: (
          <>
            <div>Average Revenue Per User</div>
            <div>(Total Revenue / All Sessions)</div>
          </>
        ),
        change: comparison ? arpu - (comparison.arpu ?? 0) : 0,
        formatValue: (n: number) => formatLongCurrency(n, currency),
      },
      {
        value: count,
        label: t(labels.orders),
        change: comparison ? count - comparison.count : 0,
        formatValue: formatLongNumber,
      },
      {
        value: unique_count,
        label: t(labels.uniqueCustomers),
        change: comparison ? unique_count - comparison.unique_count : 0,
        formatValue: formatLongNumber,
      },
    ] as any;
  }, [data]);

  const renderLabel = (type: string) => (data: any) => <MetricLabel type={type} data={data} />;

  return (
    <Column gap>
      <Grid columns="280px" gap>
        <CurrencySelect value={currency} onChange={handleCurrencyChange} />
      </Grid>
      <LoadingPanel data={data} isLoading={isLoading} error={error}>
        {data && (
          <Column gap>
            <MetricsBar>
              {metrics?.map(({ label, value, change, formatValue, tooltip }) => {
                return (
                  <MetricCard
                    key={label}
                    value={value}
                    label={label}
                    tooltip={tooltip}
                    change={change}
                    formatValue={formatValue}
                    showChange={!isAllTime}
                  />
                );
              })}
            </MetricsBar>
            <Panel>
              <RevenueChart
                data={data.chart}
                unit={unit}
                minDate={startDate}
                maxDate={endDate}
                currency={currency}
              />
            </Panel>
            <Grid gap="3">
              <GridRow layout="two">
                <Panel>
                  <Heading size="2xl">{t(labels.sources)}</Heading>
                  <Tabs>
                    <TabList>
                      <Tab id="referrer">{t(labels.referrers)}</Tab>
                      <Tab id="channel">{t(labels.channels)}</Tab>
                    </TabList>
                    <TabPanel id="referrer">
                      <ListTable
                        title={t(labels.referrer)}
                        metric={t(labels.revenue)}
                        data={data?.referrer.map(
                          ({ name, value }: { name: string; value: number }) => ({
                            label: name,
                            count: Number(value),
                            percent: (value / data?.total.sum) * 100,
                          }),
                        )}
                        formatCount={(n: number) => formatLongCurrency(n, currency)}
                        renderLabel={renderLabel('referrer')}
                      />
                    </TabPanel>
                    <TabPanel id="channel">
                      <ListTable
                        title={t(labels.channel)}
                        metric={t(labels.revenue)}
                        data={data?.channel.map(
                          ({ name, value }: { name: string; value: number }) => ({
                            label: name,
                            count: Number(value),
                            percent: (value / data?.total.sum) * 100,
                          }),
                        )}
                        formatCount={(n: number) => formatLongCurrency(n, currency)}
                        renderLabel={renderLabel('channel')}
                      />
                    </TabPanel>
                  </Tabs>
                </Panel>
                <Panel>
                  <Heading size="2xl">{t(labels.location)}</Heading>
                  <Tabs>
                    <TabList>
                      <Tab id="country">{t(labels.countries)}</Tab>
                      <Tab id="region">{t(labels.regions)}</Tab>
                    </TabList>
                    <TabPanel id="country">
                      <ListTable
                        title={t(labels.country)}
                        metric={t(labels.revenue)}
                        data={data?.country.map(
                          ({ name, value }: { name: string; value: number }) => ({
                            label: name,
                            count: Number(value),
                            percent: (value / data?.total.sum) * 100,
                          }),
                        )}
                        formatCount={(n: number) => formatLongCurrency(n, currency)}
                        renderLabel={renderLabel('country')}
                      />
                    </TabPanel>
                    <TabPanel id="region">
                      <ListTable
                        title={t(labels.region)}
                        metric={t(labels.revenue)}
                        data={data?.region.map(
                          ({
                            name,
                            value,
                            country,
                          }: {
                            name: string;
                            value: number;
                            country: string;
                          }) => ({
                            label: name,
                            country,
                            count: Number(value),
                            percent: (value / data?.total.sum) * 100,
                          }),
                        )}
                        formatCount={(n: number) => formatLongCurrency(n, currency)}
                        renderLabel={renderLabel('region')}
                      />
                    </TabPanel>
                  </Tabs>
                </Panel>
              </GridRow>
            </Grid>
            <Panel>
              <Heading size="2xl">{t(labels.customers)}</Heading>
              <RevenueSessionsDataTable websiteId={websiteId} currency={currency} />
            </Panel>
          </Column>
        )}
      </LoadingPanel>
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
