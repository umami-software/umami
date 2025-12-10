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

const KEY_NAME = 'umami.events.tab';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'chart');
  const { formatMessage, labels } = useMessages();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={key => handleSelect(key)}>
          <TabList>
            <Tab id="chart">{formatMessage(labels.chart)}</Tab>
            <Tab id="activity">{formatMessage(labels.activity)}</Tab>
            <Tab id="properties">{formatMessage(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity">
            <EventsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="chart">
            <Column gap="6">
              <Column border="bottom" paddingBottom="6">
                <EventsChart websiteId={websiteId} />
              </Column>
              <MetricsTable
                websiteId={websiteId}
                type="event"
                title={formatMessage(labels.event)}
                metric={formatMessage(labels.count)}
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
