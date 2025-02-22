'use client';
import { useMessages } from '@/components/hooks';
import { GridRow } from '@/components/layout/Grid';
import WorldMap from '@/components/metrics/WorldMap';
import { useState } from 'react';
import { Item, Tabs } from 'react-basics';
import WebsiteHeader from '../WebsiteHeader';
import { WebsiteMetrics } from '../WebsiteMetrics';
import SessionProperties from './SessionProperties';
import SessionsDataTable from './SessionsDataTable';
import SessionsMetricsBar from './SessionsMetricsBar';
import SessionsWeekly from './SessionsWeekly';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteMetrics websiteId={websiteId}>
        <SessionsMetricsBar websiteId={websiteId} />
      </WebsiteMetrics>
      <GridRow columns="two-one">
        <WorldMap websiteId={websiteId} />
        <SessionsWeekly websiteId={websiteId} />
      </GridRow>
      <Tabs selectedKey={tab} onSelect={(value: any) => setTab(value)} style={{ marginBottom: 30 }}>
        <Item key="activity">{formatMessage(labels.activity)}</Item>
        <Item key="properties">{formatMessage(labels.properties)}</Item>
      </Tabs>
      {tab === 'activity' && <SessionsDataTable websiteId={websiteId} />}
      {tab === 'properties' && <SessionProperties websiteId={websiteId} />}
    </>
  );
}

export default SessionsPage;
