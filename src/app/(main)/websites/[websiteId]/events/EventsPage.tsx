'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { EventsChart } from '@/components/metrics/EventsChart';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { getItem, setItem } from '@/lib/storage';
import { EventProperties } from './EventProperties';
import { EventsDataTable } from './EventsDataTable';
import { EventsMetricsBar } from './EventsMetricsBar';

const KEY_NAME = 'umami.events.tab';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'chart');
  const { t, labels } = useMessages();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <Panel minWidth="0" width="100%" style={{ overflow: 'hidden' }}>
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => handleSelect(key)}
          style={{ minWidth: 0, width: '100%' }}
        >
          <TabList>
            <Tab id="chart">{t(labels.chart)}</Tab>
            <Tab id="activity">{t(labels.activity)}</Tab>
            <Tab id="properties">{t(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity" style={{ minWidth: 0, width: '100%' }}>
            <EventsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="chart" style={{ minWidth: 0, width: '100%' }}>
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
          <TabPanel id="properties" style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <EventProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
