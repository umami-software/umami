'use client';
import { TabList, Tab, Tabs, TabPanel, Grid } from '@umami/react-zen';
import { useState } from 'react';
import { WebsiteHeader } from '../WebsiteHeader';
import { EventsDataTable } from './EventsDataTable';
import { EventsMetricsBar } from './EventsMetricsBar';
import { Panel } from '@/components/layout/Panel';
import { EventsChart } from '@/components/metrics/EventsChart';
import { GridRow } from '@/components/layout/GridRow';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';
import { EventProperties } from './EventProperties';

export function EventsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <Grid gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <EventsMetricsBar websiteId={websiteId} />
      <GridRow layout="two-one">
        <Panel>
          <EventsChart websiteId={websiteId} />
        </Panel>
        <Panel>
          <MetricsTable
            websiteId={websiteId}
            type="event"
            title={formatMessage(labels.events)}
            metric={formatMessage(labels.actions)}
          />
        </Panel>
      </GridRow>
      <Panel marginY="6">
        <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
          <TabList>
            <Tab id="activity">{formatMessage(labels.activity)}</Tab>
            <Tab id="properties">{formatMessage(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity">
            <EventsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="properties">
            <EventProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Grid>
  );
}
