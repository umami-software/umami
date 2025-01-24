import { WebsiteContext } from 'app/(main)/websites/[websiteId]/WebsiteProvider';
import Breadcrumb from 'components/common/Breadcrumb';
import { useMessages } from 'components/hooks';
import Icons from 'components/icons';
import PageHeader from 'components/layout/PageHeader';
import Link from 'next/link';
import { Key, useContext, useState } from 'react';
import { Button, Icon, Item, Tabs, Text, useToasts } from 'react-basics';
import ShareUrl from './ShareUrl';
import TrackingCode from './TrackingCode';
import WebsiteData from './WebsiteData';
import WebsiteEditForm from './WebsiteEditForm';

export function WebsiteSettings({
  websiteId,
  openExternal = false,
}: {
  websiteId: string;
  openExternal?: boolean;
}) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels, messages } = useMessages();
  const [tab, setTab] = useState<Key>('details');
  const { showToast } = useToasts();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const breadcrumb = (
    <Breadcrumb
      data={[
        {
          label: formatMessage(labels.websites),
          url: website.teamId ? `/teams/${website.teamId}/settings/websites` : '/settings/websites',
        },
        {
          label: website.name,
        },
      ]}
    />
  );

  return (
    <>
      <PageHeader title={website?.name} icon={<Icons.Globe />} breadcrumb={breadcrumb}>
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
      {tab === 'details' && <WebsiteEditForm websiteId={websiteId} onSave={handleSave} />}
      {tab === 'tracking' && <TrackingCode websiteId={websiteId} />}
      {tab === 'share' && <ShareUrl onSave={handleSave} />}
      {tab === 'data' && <WebsiteData websiteId={websiteId} onSave={handleSave} />}
    </>
  );
}

export default WebsiteSettings;
