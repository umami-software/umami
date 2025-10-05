'use client';
import { Key, useState } from 'react';
import { TabList, Tab, Tabs, TabPanel, Column, Modal, Dialog } from '@umami/react-zen';
import { SessionsDataTable } from './SessionsDataTable';
import { SessionProperties } from './SessionProperties';
import { useMessages, useNavigation } from '@/components/hooks';
import { Panel } from '@/components/common/Panel';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { getItem, setItem } from '@/lib/storage';
import { SessionProfile } from '@/app/(main)/websites/[websiteId]/sessions/SessionProfile';

const KEY_NAME = 'umami.sessions.tab';

export function SessionsPage({ websiteId }) {
  const [tab, setTab] = useState(getItem(KEY_NAME) || 'activity');
  const { formatMessage, labels } = useMessages();
  const {
    router,
    query: { session },
    updateParams,
  } = useNavigation();

  const handleClose = (close: () => void) => {
    router.push(updateParams({ session: undefined }));
    close();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      router.push(updateParams({ session: undefined }));
    }
  };

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
      <Modal isOpen={!!session} onOpenChange={handleOpenChange} isDismissable>
        <Dialog
          style={{
            maxWidth: 1320,
            width: '100vw',
            minHeight: '300px',
            height: 'calc(100vh - 40px)',
          }}
        >
          {({ close }) => {
            return (
              <SessionProfile
                websiteId={websiteId}
                sessionId={session}
                onClose={() => handleClose(close)}
              />
            );
          }}
        </Dialog>
      </Modal>
    </Column>
  );
}
