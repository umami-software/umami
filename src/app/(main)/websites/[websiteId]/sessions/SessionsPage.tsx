'use client';
import { Column, Tabs, TabsContent, TabsList, TabsTrigger } from '@umami/react-zen';
import { type Key, useState } from 'react';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
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
      <Tabs value={tab} onValueChange={handleSelect} style={{ minWidth: 0, width: '100%' }}>
        <TabsList>
          <TabsTrigger value="activity">{t(labels.activity)}</TabsTrigger>
          <TabsTrigger value="properties">{t(labels.properties)}</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" style={{ minWidth: 0, width: '100%' }}>
          <SessionsDataTable websiteId={websiteId} />
        </TabsContent>
        <TabsContent value="properties" style={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
          <SessionProperties websiteId={websiteId} />
        </TabsContent>
      </Tabs>
    </Column>
  );
}
