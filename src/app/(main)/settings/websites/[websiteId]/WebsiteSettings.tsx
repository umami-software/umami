import { useContext } from 'react';
import { Button, Icon, Tabs, TabList, Tab, TabPanel, Text } from '@umami/react-zen';
import Link from 'next/link';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { ShareUrl } from './ShareUrl';
import { TrackingCode } from './TrackingCode';
import { WebsiteData } from './WebsiteData';
import { WebsiteEditForm } from './WebsiteEditForm';

export function WebsiteSettings({
  websiteId,
  openExternal = false,
}: {
  websiteId: string;
  openExternal?: boolean;
}) {
  const website = useContext(WebsiteContext);
  const { formatMessage, labels } = useMessages();

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
      <Tabs>
        <TabList>
          <Tab id="details">{formatMessage(labels.details)}</Tab>
          <Tab id="tracking">{formatMessage(labels.trackingCode)}</Tab>
          <Tab id="share"> {formatMessage(labels.shareUrl)}</Tab>
          <Tab id="data">{formatMessage(labels.data)}</Tab>
        </TabList>
        <TabPanel id="details">
          <WebsiteEditForm websiteId={websiteId} />
        </TabPanel>
        <TabPanel id="tracking">
          <TrackingCode websiteId={websiteId} />
        </TabPanel>
        <TabPanel id="share">
          <ShareUrl />
        </TabPanel>
        <TabPanel id="data">
          <WebsiteData websiteId={websiteId} />
        </TabPanel>
      </Tabs>
    </>
  );
}
