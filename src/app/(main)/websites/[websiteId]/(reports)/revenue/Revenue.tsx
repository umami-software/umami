import {
  Column,
  Grid,
  Heading,
  ListItem,
  Row,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  useDateRange,
  useMessages,
  useNavigation,
  useRevenueChartQuery,
  useRevenueStatsQuery,
} from '@/components/hooks';
import { CurrencySelect } from '@/components/input/CurrencySelect';
import { CURRENCY_CONFIG, DEFAULT_CURRENCY } from '@/lib/constants';
import { getItem, setItem } from '@/lib/storage';
import { SessionModal } from '../../sessions/SessionModal';
import { RevenueChart } from './RevenueChart';
import { RevenueMetricsBar } from './RevenueMetricsBar';
import { RevenueMetricsTable } from './RevenueMetricsTable';
import { RevenueSessionsDataTable } from './RevenueSessionsDataTable';

type RevenueChartMode = 'period' | 'cumulative';
type SourceTab = 'referrer' | 'channel';
type LocationTab = 'country' | 'region';

export interface RevenueProps {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  unit: string;
}

export function Revenue({ websiteId, startDate, endDate, unit }: RevenueProps) {
  const [sourceTab, setSourceTab] = useState<SourceTab>('referrer');
  const [locationTab, setLocationTab] = useState<LocationTab>('country');
  const [currency, setCurrency] = useState(
    getItem(CURRENCY_CONFIG) || process.env.defaultCurrency || DEFAULT_CURRENCY,
  );
  const {
    router,
    query: { revenueChart },
    updateParams,
  } = useNavigation();
  const revenueChartMode: RevenueChartMode =
    revenueChart === 'cumulative' ? 'cumulative' : 'period';

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setItem(CURRENCY_CONFIG, value);
  };

  const handleRevenueChartModeChange = (value: RevenueChartMode) => {
    router.push(updateParams({ revenueChart: value }));
  };

  const { t, labels } = useMessages();
  const { compare } = useDateRange();
  const chartQuery = useRevenueChartQuery(websiteId, currency);
  const statsQuery = useRevenueStatsQuery({ websiteId, currency, compare });
  const data = useMemo(
    () =>
      chartQuery.data && statsQuery.data
        ? { chart: chartQuery.data.chart, total: statsQuery.data }
        : null,
    [chartQuery.data, statsQuery.data],
  );
  const error = chartQuery.error || statsQuery.error;
  const isFetching = chartQuery.isFetching || statsQuery.isFetching;
  const isLoading = chartQuery.isLoading || statsQuery.isLoading;

  return (
    <Column gap>
      <Grid columns="280px" gap>
        <CurrencySelect value={currency} onChange={handleCurrencyChange} />
      </Grid>
      <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
        {data && (
          <Column gap>
            <RevenueMetricsBar data={data.total} currency={currency} />
            <Panel>
              <Row justifyContent="end">
                <Select
                  value={revenueChartMode}
                  onChange={handleRevenueChartModeChange}
                  popoverProps={{ placement: 'bottom right' }}
                  style={{ width: 140 }}
                >
                  <ListItem id="period">{t(labels.period)}</ListItem>
                  <ListItem id="cumulative">{t(labels.cumulative)}</ListItem>
                </Select>
              </Row>
              <RevenueChart
                data={data.chart}
                mode={revenueChartMode}
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
                  <Tabs
                    selectedKey={sourceTab}
                    onSelectionChange={key => setSourceTab(String(key) as SourceTab)}
                  >
                    <TabList>
                      <Tab id="referrer">{t(labels.referrers)}</Tab>
                      <Tab id="channel">{t(labels.channels)}</Tab>
                    </TabList>
                    <TabPanel id="referrer">
                      <RevenueMetricsTable
                        websiteId={websiteId}
                        currency={currency}
                        type="referrer"
                        title={t(labels.referrer)}
                        totalRevenue={Number(data?.total.sum) || 0}
                        enabled={sourceTab === 'referrer'}
                      />
                    </TabPanel>
                    <TabPanel id="channel">
                      <RevenueMetricsTable
                        websiteId={websiteId}
                        currency={currency}
                        type="channel"
                        title={t(labels.channel)}
                        totalRevenue={Number(data?.total.sum) || 0}
                        enabled={sourceTab === 'channel'}
                      />
                    </TabPanel>
                  </Tabs>
                </Panel>
                <Panel>
                  <Heading size="2xl">{t(labels.location)}</Heading>
                  <Tabs
                    selectedKey={locationTab}
                    onSelectionChange={key => setLocationTab(String(key) as LocationTab)}
                  >
                    <TabList>
                      <Tab id="country">{t(labels.countries)}</Tab>
                      <Tab id="region">{t(labels.regions)}</Tab>
                    </TabList>
                    <TabPanel id="country">
                      <RevenueMetricsTable
                        websiteId={websiteId}
                        currency={currency}
                        type="country"
                        title={t(labels.country)}
                        totalRevenue={Number(data?.total.sum) || 0}
                        enabled={locationTab === 'country'}
                      />
                    </TabPanel>
                    <TabPanel id="region">
                      <RevenueMetricsTable
                        websiteId={websiteId}
                        currency={currency}
                        type="region"
                        title={t(labels.region)}
                        totalRevenue={Number(data?.total.sum) || 0}
                        enabled={locationTab === 'region'}
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
