'use client';
import WebsiteHeader from '../WebsiteHeader';
import EventsDataTable from './EventsDataTable';
import EventsMetricsBar from './EventsMetricsBar';
import EventsChart from '@/components/metrics/EventsChart';
import { GridRow } from '@/components/layout/Grid';
import EventsTable from '@/components/metrics/EventsTable';
import { useMessages } from '@/components/hooks';
import { Item, Tabs } from 'react-basics';
import { useState } from 'react';
import EventProperties from './EventProperties';
import { getItem, setItem } from '@/lib/storage';

export default function EventsPage({ websiteId }) {
  const [label, setLabel] = useState(null);
  const [tab, setTab] = useState(getItem('eventTab') || 'activity');
  const { formatMessage, labels } = useMessages();

  const handleLabelClick = (value: string) => {
    setLabel(value !== label ? value : '');
  };

  const onSelect = (value: 'activity' | 'properties') => {
    setItem('eventTab', value);
    setTab(value);
  };

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
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
      <div>
        <Tabs selectedKey={tab} onSelect={onSelect} style={{ marginBottom: 30 }}>
          <Item key="activity">{formatMessage(labels.activity)}</Item>
          <Item key="properties">{formatMessage(labels.properties)}</Item>
        </Tabs>
        {tab === 'activity' && <EventsDataTable websiteId={websiteId} />}
        {tab === 'properties' && <EventProperties websiteId={websiteId} />}
      </div>
    </>
  );
}
