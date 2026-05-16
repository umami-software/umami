'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { getItem, setItem } from '@/lib/storage';
import { SessionModal } from './SessionModal';
import { SessionProperties } from './SessionProperties';
import { SessionsDataTable } from './SessionsDataTable';

const KEY_NAME = 'umami.sessions.tab';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'activity');
  const { t, labels } = useMessages();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  return (
    <Column gap="3">
      <WebsiteControls websiteId={websiteId} />
      <SessionModal websiteId={websiteId} />
      <Panel minWidth="0" width="100%" style={{ overflow: 'hidden' }}>
        <Tabs
          selectedKey={tab}
          onSelectionChange={handleSelect}
          style={{ minWidth: 0, width: '100%' }}
        >
          <TabList>
            <Tab id="activity">{t(labels.activity)}</Tab>
            <Tab id="properties">{t(labels.properties)}</Tab>
          </TabList>
          <TabPanel id="activity" style={{ minWidth: 0, width: '100%' }}>
            <SessionsDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="properties" style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <SessionProperties websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
    </Column>
  );
}
