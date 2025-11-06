'use client';
import { TabList, Tab, Tabs, TabPanel, Column } from '@umami/react-zen';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useState, Key } from 'react';
import { EventsDataTable } from './EventsDataTable';
import { Panel } from '@/components/common/Panel';
import { EventsChart } from '@/components/metrics/EventsChart';
import { useMessages } from '@/components/hooks';
import { EventProperties } from './EventProperties';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { getItem, setItem } from '@/lib/storage';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';

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
