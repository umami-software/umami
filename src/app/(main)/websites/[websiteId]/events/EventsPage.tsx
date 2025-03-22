'use client';
import { WebsiteHeader } from '../WebsiteHeader';
import { EventsDataTable } from './EventsDataTable';
import { EventsMetricsBar } from './EventsMetricsBar';
import { EventsChart } from '@/components/metrics/EventsChart';
import { GridRow } from '@/components/layout/Grid';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';
import { TabList, Tab, Tabs } from '@umami/react-zen';
import { useState } from 'react';
import { EventProperties } from './EventProperties';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <GridRow columns="two-one">
        <EventsChart websiteId={websiteId} />
        <MetricsTable
          websiteId={websiteId}
          type="event"
          title={formatMessage(labels.events)}
          metric={formatMessage(labels.actions)}
        />
      </GridRow>
      <div>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(value: any) => setTab(value)}
          style={{ marginBottom: 30 }}
        >
          <TabList>
            <Tab key="activity">{formatMessage(labels.activity)}</Tab>
            <Tab key="properties">{formatMessage(labels.properties)}</Tab>
          </TabList>
        </Tabs>
        {tab === 'activity' && <EventsDataTable websiteId={websiteId} />}
        {tab === 'properties' && <EventProperties websiteId={websiteId} />}
      </div>
    </>
  );
}
