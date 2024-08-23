'use client';
import WebsiteHeader from '../WebsiteHeader';
import EventsDataTable from './EventsDataTable';
import EventsMetricsBar from './EventsMetricsBar';
import EventsChart from 'components/metrics/EventsChart';
import { GridRow } from 'components/layout/Grid';
import MetricsTable from 'components/metrics/MetricsTable';
import { useMessages } from 'components/hooks';
import { Item, Tabs } from 'react-basics';
import { useState } from 'react';
import EventProperties from './EventProperties';

export default function EventsPage({ websiteId }) {
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
          onSelect={(value: any) => setTab(value)}
          style={{ marginBottom: 30 }}
        >
          <Item key="activity">{formatMessage(labels.activity)}</Item>
          <Item key="properties">{formatMessage(labels.properties)}</Item>
        </Tabs>
        {tab === 'activity' && <EventsDataTable websiteId={websiteId} />}
        {tab === 'properties' && <EventProperties websiteId={websiteId} />}
      </div>
    </>
  );
}
