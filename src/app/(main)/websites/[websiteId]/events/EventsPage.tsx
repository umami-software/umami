'use client';
import { useMessages } from '@/components/hooks';
import { GridRow } from '@/components/layout/Grid';
import EventsChart from '@/components/metrics/EventsChart';
import EventsTable from '@/components/metrics/EventsTable';
import { useState } from 'react';
import { Item, Tabs } from 'react-basics';
import WebsiteHeader from '../WebsiteHeader';
import WebsiteMetrics from '../WebsiteMetrics';
import EventProperties from './EventProperties';
import EventsDataTable from './EventsDataTable';
import EventsMetricsBar from './EventsMetricsBar';

export default function EventsPage({ websiteId }) {
  const [label, setLabel] = useState(null);
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  const handleLabelClick = (value: string) => {
    setLabel(value !== label ? value : '');
  };

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteMetrics websiteId={websiteId}>
        <EventsMetricsBar websiteId={websiteId} />
      </WebsiteMetrics>
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
