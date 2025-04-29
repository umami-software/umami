'use client';
import { TabList, Tab, Tabs, TabPanel, Column } from '@umami/react-zen';
import { EventsTable } from '@/components/metrics/EventsTable';
import { useState } from 'react';
import { WebsiteHeader } from '../WebsiteHeader';
import { EventsDataTable } from './EventsDataTable';
import { EventsMetricsBar } from './EventsMetricsBar';
import { Panel } from '@/components/common/Panel';
import { EventsChart } from '@/components/metrics/EventsChart';
import { GridRow } from '@/components/common/GridRow';
import { MetricsTable } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';
import { EventProperties } from './EventProperties';

export function EventsPage({ websiteId }) {
  const [label, setLabel] = useState(null);
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  const handleLabelClick = (value: string) => {
    setLabel(value !== label ? value : '');
  };

  return (
    <Column gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <Panel>
        <EventsMetricsBar websiteId={websiteId} />
      </Panel>
      <GridRow layout="two-one">
        <Panel gridColumn="span 2">
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
      <EventsMetricsBar websiteId={websiteId} />
      <GridRow columns="two-one">
        <EventsChart websiteId={websiteId} focusLabel={label} />
        <EventsTable
          websiteId={websiteId}
          type="event"
          title={formatMessage(labels.events)}
          metric={formatMessage(labels.actions)}
          onLabelClick={handleLabelClick}
        />
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
    </Column>
  );
}
