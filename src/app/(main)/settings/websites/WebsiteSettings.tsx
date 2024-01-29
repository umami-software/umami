'use client';
import { useState, Key } from 'react';
import { Item, Tabs, Button, Text, Icon, Loading } from 'react-basics';
import Link from 'next/link';
import Icons from 'components/icons';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from './[id]/WebsiteEditForm';
import WebsiteData from './[id]/WebsiteData';
import TrackingCode from './[id]/TrackingCode';
import ShareUrl from './[id]/ShareUrl';
import { useWebsite, useMessages } from 'components/hooks';
import WebsiteContext from 'app/(main)/websites/[id]/WebsiteContext';

export function WebsiteSettings({ websiteId, openExternal = false }) {
  const { formatMessage, labels } = useMessages();
  const { data: website, isLoading, refetch } = useWebsite(websiteId, { gcTime: 0 });
  const [tab, setTab] = useState<Key>('details');

  const handleSave = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading position="page" />;
  }

  return (
    <WebsiteContext.Provider value={website}>
      <PageHeader title={website?.name} icon={<Icons.Globe />}>
        <Link href={`/websites/${websiteId}`} target={openExternal ? '_blank' : null}>
          <Button variant="primary">
            <Icon>
              <Icons.External />
            </Icon>
            <Text>{formatMessage(labels.view)}</Text>
          </Button>
        </Link>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="tracking">{formatMessage(labels.trackingCode)}</Item>
        <Item key="share">{formatMessage(labels.shareUrl)}</Item>
        <Item key="data">{formatMessage(labels.data)}</Item>
      </Tabs>
      {tab === 'details' && <WebsiteEditForm website={website} onSave={handleSave} />}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} />}
      {tab === 'share' && <ShareUrl website={website} onSave={handleSave} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} />}
    </WebsiteContext.Provider>
  );
}

export default WebsiteSettings;
