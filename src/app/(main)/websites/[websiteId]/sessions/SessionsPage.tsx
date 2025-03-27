'use client';
import { useState } from 'react';
import { TabList, Tab, Tabs, TabPanel, Column } from '@umami/react-zen';
import { WebsiteHeader } from '../WebsiteHeader';
import { SessionsDataTable } from './SessionsDataTable';
import { SessionsMetricsBar } from './SessionsMetricsBar';
import { SessionProperties } from './SessionProperties';
import { WorldMap } from '@/components/metrics/WorldMap';
import { GridRow } from '@/components/common/GridRow';
import { useMessages } from '@/components/hooks';
import { SessionsWeekly } from './SessionsWeekly';
import { Panel } from '@/components/common/Panel';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState('activity');
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="3">
      <WebsiteHeader websiteId={websiteId} />
      <Panel>
        <SessionsMetricsBar websiteId={websiteId} />
      </Panel>
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
    </Column>
  );
}
