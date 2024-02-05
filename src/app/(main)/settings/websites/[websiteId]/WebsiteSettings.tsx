'use client';
import { useState, Key, useContext } from 'react';
import { Item, Tabs, Button, Text, Icon } from 'react-basics';
import Link from 'next/link';
import Icons from 'components/icons';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from './WebsiteEditForm';
import WebsiteData from './WebsiteData';
import TrackingCode from './TrackingCode';
import ShareUrl from './ShareUrl';
import { useMessages } from 'components/hooks';
import { WebsiteContext } from 'app/(main)/websites/[websiteId]/WebsiteProvider';

export function WebsiteSettings({ websiteId, openExternal = false }) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels } = useMessages();
  const [tab, setTab] = useState<Key>('details');

  return (
    <>
      <PageHeader title={website?.name} icon={<Icons.Globe />}>
        <Link href={`/websites/${websiteId}`} target={openExternal ? '_blank' : null}>
          <Button variant="primary">
            <Icon>
              <Icons.ArrowRight />
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
      {tab === 'details' && <WebsiteEditForm websiteId={websiteId} />}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} />}
      {tab === 'share' && <ShareUrl websiteId={websiteId} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} />}
    </>
  );
}

export default WebsiteSettings;
