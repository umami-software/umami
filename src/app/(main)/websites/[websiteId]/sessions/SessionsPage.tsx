'use client';
import { Key, useState } from 'react';
import { TabList, Tab, Tabs, TabPanel, Column } from '@umami/react-zen';
import { SessionsDataTable } from './SessionsDataTable';
import { SessionProperties } from './SessionProperties';
import { useMessages } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { getItem, setItem } from '@/lib/storage';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';

const KEY_NAME = 'umami.sessions.tab';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'activity');
  const { formatMessage, labels } = useMessages();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <Panel>
        <Tabs selectedKey={tab} onSelectionChange={handleSelect}>
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
      <SessionModal websiteId={websiteId} />
    </Column>
  );
}
