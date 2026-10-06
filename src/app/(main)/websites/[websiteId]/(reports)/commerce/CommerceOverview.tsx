import {
  Column,
  Heading,
  ListItem,
  Row,
  Select,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@umami/react-zen';
import { useState } from 'react';
import { GridRow } from '@/components/common/GridRow';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import {
  type CommerceScope,
  useCommerceChartQuery,
  useCommerceStatsQuery,
  useDateRange,
  useMessages,
  useNavigation,
} from '@/components/hooks';
import type { CommerceMetricType } from '@/lib/commerce-reports';
import { RevenueChart } from '../revenue/RevenueChart';
import { CommerceMetricsBar } from './CommerceMetricsBar';
import { CommerceMetricsTable } from './CommerceMetricsTable';
import { CommerceOrdersTable } from './CommerceOrdersTable';

export interface CommerceOverviewProps {
  websiteId: string;
  scope: CommerceScope;
  startDate: Date;
  endDate: Date;
  unit: string;
}

type ChartMode = 'period' | 'cumulative';

export function CommerceOverview({
  websiteId,
  scope,
  startDate,
  endDate,
  unit,
}: CommerceOverviewProps) {
  const { t, labels } = useMessages();
  const { compare } = useDateRange();
  const {
    router,
    updateParams,
    query: { revenueChart },
  } = useNavigation();
  const chartMode: ChartMode = revenueChart === 'cumulative' ? 'cumulative' : 'period';
  const statsQuery = useCommerceStatsQuery(websiteId, { ...scope, compare });
  const chartQuery = useCommerceChartQuery(websiteId, scope);

  return (
    <Column gap>
      <LoadingPanel
        data={statsQuery.data}
        isLoading={statsQuery.isLoading}
        isFetching={statsQuery.isFetching}
        error={statsQuery.error}
      >
        {statsQuery.data && <CommerceMetricsBar data={statsQuery.data} currency={scope.currency} />}
      </LoadingPanel>
      <Panel>
        <Row justifyContent="end">
          <Select
            value={chartMode}
            onChange={value =>
              router.replace(updateParams({ revenueChart: value as string }), { scroll: false })
            }
            popoverProps={{ side: 'bottom', align: 'end' }}
            buttonProps={{ style: { width: 140 } }}
          >
            <ListItem id="period">{t(labels.period)}</ListItem>
            <ListItem id="cumulative">{t(labels.cumulative)}</ListItem>
          </Select>
        </Row>
        <LoadingPanel
          data={chartQuery.data}
          isLoading={chartQuery.isLoading}
          isFetching={chartQuery.isFetching}
          error={chartQuery.error}
          minHeight="400px"
        >
          {chartQuery.data && (
            <RevenueChart
              data={chartQuery.data.chart}
              mode={chartMode}
              unit={unit}
              minDate={startDate}
              maxDate={endDate}
              currency={scope.currency}
            />
          )}
        </LoadingPanel>
      </Panel>
      <GridRow layout="two">
        <DimensionPanel
          websiteId={websiteId}
          scope={scope}
          title={t('commerce.sources')}
          tabs={[
            ['channel', t(labels.channels)],
            ['referrer', t(labels.referrers)],
            ['utmSource', t(labels.utmSource)],
            ['utmCampaign', t(labels.utmCampaign)],
          ]}
        />
        <DimensionPanel
          websiteId={websiteId}
          scope={scope}
          title={t('commerce.location')}
          tabs={[
            ['country', t(labels.countries)],
            ['region', t(labels.regions)],
            ['city', t(labels.cities)],
            ['market', t('commerce.markets')],
          ]}
        />
      </GridRow>
      <GridRow layout="two">
        <DimensionPanel
          websiteId={websiteId}
          scope={scope}
          title={t('commerce.technology')}
          tabs={[
            ['device', t(labels.devices)],
            ['browser', t(labels.browsers)],
            ['os', t(labels.os)],
          ]}
        />
        <DimensionPanel
          websiteId={websiteId}
          scope={scope}
          title={t(labels.pages)}
          tabs={[
            ['entry', t(labels.entry)],
            ['event', t(labels.events)],
          ]}
        />
      </GridRow>
      <Panel>
        <Heading size="2xl">{t('commerce.orders')}</Heading>
        <CommerceOrdersTable websiteId={websiteId} scope={scope} />
      </Panel>
    </Column>
  );
}

function DimensionPanel({
  websiteId,
  scope,
  title,
  tabs,
}: {
  websiteId: string;
  scope: CommerceScope;
  title: string;
  tabs: [CommerceMetricType, string][];
}) {
  const [selected, setSelected] = useState<CommerceMetricType>(tabs[0][0]);

  return (
    <Panel>
      <Heading size="2xl">{title}</Heading>
      <Tabs
        selectedKey={selected}
        onSelectionChange={key => setSelected(key as CommerceMetricType)}
      >
        <TabList>
          {tabs.map(([type, label]) => (
            <Tab key={type} id={type}>
              {label}
            </Tab>
          ))}
        </TabList>
        {tabs.map(([type, label]) => (
          <TabPanel key={type} id={type}>
            <CommerceMetricsTable
              websiteId={websiteId}
              scope={scope}
              type={type}
              title={label}
              enabled={selected === type}
            />
          </TabPanel>
        ))}
      </Tabs>
    </Panel>
  );
}
