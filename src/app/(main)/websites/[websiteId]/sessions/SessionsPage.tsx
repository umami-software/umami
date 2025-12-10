'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { getItem, setItem } from '@/lib/storage';
import { SessionProperties } from './SessionProperties';
import { SessionsDataTable } from './SessionsDataTable';

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
