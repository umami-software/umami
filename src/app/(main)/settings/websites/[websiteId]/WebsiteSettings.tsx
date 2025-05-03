import { useContext } from 'react';
import { Icon, Tabs, TabList, Tab, TabPanel, Text } from '@umami/react-zen';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { useMessages } from '@/components/hooks';
import { Icons } from '@/components/icons';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ShareUrl } from './ShareUrl';
import { TrackingCode } from './TrackingCode';
import { WebsiteData } from './WebsiteData';
import { WebsiteEditForm } from './WebsiteEditForm';
import { LinkButton } from '@/components/common/LinkButton';

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
      <SectionHeader title={website?.name} icon={<Icons.Globe />}>
        <LinkButton
          variant="primary"
          href={`/websites/${websiteId}`}
          target={openExternal ? '_blank' : null}
        >
          <Icon>
            <Icons.Arrow />
          </Icon>
          <Text>{formatMessage(labels.view)}</Text>
        </LinkButton>
      </SectionHeader>
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
