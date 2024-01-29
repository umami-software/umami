'use client';
import { useState, Key } from 'react';
import { Item, Tabs, useToasts, Button, Text, Icon, Icons, Loading } from 'react-basics';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from 'components/layout/PageHeader';
import WebsiteEditForm from './[id]/WebsiteEditForm';
import WebsiteData from './[id]/WebsiteData';
import TrackingCode from './[id]/TrackingCode';
import ShareUrl from './[id]/ShareUrl';
import { useWebsite, useMessages } from 'components/hooks';
import { touch } from 'store/cache';

export function WebsiteSettings({ websiteId, openExternal = false }) {
  const router = useRouter();
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();

  const { data: website, isLoading } = useWebsite(websiteId, { gcTime: 0 });
  const [tab, setTab] = useState<Key>('details');

  const showSuccess = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleSave = () => {
    showSuccess();
    touch('websites');
  };

  const handleReset = async (value: string) => {
    if (value === 'delete') {
      router.push('/settings/websites');
    } else if (value === 'reset') {
      showSuccess();
    }
  };

  if (isLoading) {
    return <Loading position="page" />;
  }

  return (
    <>
      <PageHeader title={website?.name}>
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
      {tab === 'details' && (
        <WebsiteEditForm websiteId={websiteId} data={website} onSave={handleSave} />
      )}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} />}
      {tab === 'share' && <ShareUrl websiteId={websiteId} data={website} onSave={handleSave} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} onSave={handleReset} />}
    </>
  );
}

export default WebsiteSettings;
