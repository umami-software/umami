'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import locale from 'date-fns/locale/af';
import { type Key, useMemo, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { useEventStatsQuery } from '@/components/hooks/queries/useEventStatsQuery';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { formatLongNumber } from '@/lib/format';
import { getItem, setItem } from '@/lib/storage';
import { EventProperties } from './EventProperties';
import { EventsDataTable } from './EventsDataTable';

const KEY_NAME = 'umami.events.tab';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'chart');
  const { t, labels, getErrorMessage } = useMessages();
  const { data, isLoading, isFetching, error } = useEventStatsQuery({
    websiteId,
  });

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  const metrics = useMemo(() => {
    if (!data) return [];

    const { events, visitors, visits, uniqueEvents } = data || {};

    return [
      {
        value: visitors,
        label: t(labels.visitors),
        formatValue: formatLongNumber,
      },
      {
        value: visits,
        label: t(labels.visits),
        formatValue: formatLongNumber,
      },
      {
        value: events,
        label: t(labels.events),
        formatValue: formatLongNumber,
      },
      {
        value: uniqueEvents,
        label: t(labels.uniqueEvents),
        formatValue: formatLongNumber,
      },
    ] as any;
  }, [data, locale]);

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <LoadingPanel
        data={metrics}
        isLoading={isLoading}
        isFetching={isFetching}
        error={getErrorMessage(error)}
        minHeight="136px"
      >
        <MetricsBar>
          {metrics?.map(({ label, value, formatValue }) => {
            return <MetricCard key={label} value={value} label={label} formatValue={formatValue} />;
          })}
        </MetricsBar>
      </LoadingPanel>
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={key => handleSelect(key)}>
          <TabList>
            <Tab id="chart">{t(labels.chart)}</Tab>
            <Tab id="activity">{t(labels.activity)}</Tab>
            <Tab id="properties">{t(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity">
            <EventsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="chart">
            <Column gap="6">
              <Column border="bottom" paddingBottom="6">
                <EventsChart websiteId={websiteId} limit={50} />
              </Column>
              <MetricsTable
                websiteId={websiteId}
                type="event"
                title={t(labels.event)}
                metric={t(labels.count)}
                limit={50}
              />
            </Column>
          </TabPanel>
          <TabPanel id="properties">
            <EventProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
