'use client';
import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages } from '@/components/hooks';
import { getItem, setItem } from '@/lib/storage';
import { ReplayModal } from './ReplayModal';
import { ReplaysDataTable } from './ReplaysDataTable';
import { SavedReplaysDataTable } from './SavedReplaysDataTable';

const KEY_NAME = 'umami.replays.tab';

export function ReplaysPage({ websiteId }: { websiteId: string }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'replays');
  const { t, labels } = useMessages();

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
            <Tab id="replays">{t(labels.replays)}</Tab>
            <Tab id="saved">{t(labels.saved)}</Tab>
          </TabList>
          <TabPanel id="replays">
            <ReplaysDataTable websiteId={websiteId} />
          </TabPanel>
          <TabPanel id="saved">
            <SavedReplaysDataTable websiteId={websiteId} />
          </TabPanel>
        </Tabs>
      </Panel>
      <SessionModal websiteId={websiteId} />
      <ReplayModal websiteId={websiteId} />
    </Column>
  );
}
