'use client';
import { Button, Column, Tab, TabList, TabPanel, Tabs, Text } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { SessionModal } from '@/app/(main)/websites/[websiteId]/sessions/SessionModal';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { Panel } from '@/components/common/Panel';
import { useMessages, useSubscription } from '@/components/hooks';
import { getItem, setItem } from '@/lib/storage';
import { ReplayModal } from './ReplayModal';
import { ReplaysDataTable } from './ReplaysDataTable';
import { SavedReplaysDataTable } from './SavedReplaysDataTable';

const KEY_NAME = 'umami.replays.tab';

export function ReplaysPage({ websiteId }: { websiteId: string }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'replays');
  const { t, labels, messages } = useMessages();
  const { hasFeature, cloudMode } = useSubscription();

  const handleSelect = (value: Key) => {
    setItem(KEY_NAME, value);
    setTab(value);
  };

  if (cloudMode && !hasFeature('replays')) {
    return (
      <Column gap="3">
        <Panel>
          <Column gap="4" alignItems="center" padding="10">
            <Text>{t(messages.upgradeRequired, { plan: 'Business' })}</Text>
            <Button variant="primary" onPress={() => window.open(`${process.env.cloudUrl}/settings/billing`, '_blank')}>
              {t(labels.upgrade)}
            </Button>
          </Column>
        </Panel>
      </Column>
    );
  }

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
