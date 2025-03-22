'use client';
import { WebsiteHeader } from '../WebsiteHeader';
import { SessionsDataTable } from './SessionsDataTable';
import { SessionsMetricsBar } from './SessionsMetricsBar';
import { SessionProperties } from './SessionProperties';
import { WorldMap } from '@/components/metrics/WorldMap';
import { GridRow } from '@/components/layout/Grid';
import { TabList, Tab, Tabs } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { SessionsWeekly } from './SessionsWeekly';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <SessionsMetricsBar websiteId={websiteId} />
      <GridRow columns="two-one">
        <WorldMap websiteId={websiteId} />
        <SessionsWeekly websiteId={websiteId} />
      </GridRow>
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
      {tab === 'activity' && <SessionsDataTable websiteId={websiteId} />}
      {tab === 'properties' && <SessionProperties websiteId={websiteId} />}
    </>
  );
}
