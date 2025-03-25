'use client';
import { WebsiteHeader } from '../WebsiteHeader';
import { SessionsDataTable } from './SessionsDataTable';
import { SessionsMetricsBar } from './SessionsMetricsBar';
import { SessionProperties } from './SessionProperties';
import { WorldMap } from '@/components/metrics/WorldMap';
import { GridRow } from '@/components/layout/GridRow';
import { TabList, Tab, Tabs, TabPanel } from '@umami/react-zen';
import { useState } from 'react';
import { useMessages } from '@/components/hooks';
import { SessionsWeekly } from './SessionsWeekly';
import { Panel } from '@/components/layout/Panel';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <SessionsMetricsBar websiteId={websiteId} />
      <GridRow layout="two-one">
        <Panel padding="0">
          <WorldMap websiteId={websiteId} />
        </Panel>
        <Panel>
          <SessionsWeekly websiteId={websiteId} />
        </Panel>
      </GridRow>
      <Panel marginY="6">
        <Tabs selectedKey={tab} onSelectionChange={(value: any) => setTab(value)}>
          <TabList>
            <Tab id="activity">{formatMessage(labels.activity)}</Tab>
            <Tab id="properties">{formatMessage(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity">
            <SessionsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="properties">
            <SessionProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </>
  );
}
