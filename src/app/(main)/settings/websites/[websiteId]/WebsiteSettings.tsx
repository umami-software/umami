import { useContext } from 'react';
import { Icon, Tabs, TabList, Tab, TabPanel, Text } from '@umami/react-zen';
import { WebsiteContext } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { useMessages } from '@/components/hooks';
import { Globe, Eye } from '@/components/icons';
import { SectionHeader } from '@/components/common/SectionHeader';
import { WebsiteShareForm } from './WebsiteShareForm';
import { WebsiteTrackingCode } from './WebsiteTrackingCode';
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
      <SectionHeader title={website?.name} icon={<Globe />}>
        <LinkButton href={`/websites/${websiteId}`} target={openExternal ? '_blank' : null}>
          <Icon>
            <Eye />
          </Icon>
          <Text>{formatMessage(labels.view)}</Text>
        </LinkButton>
      </SectionHeader>
      <Tabs>
        <TabList>
          <Tab id="details">{formatMessage(labels.details)}</Tab>
          <Tab id="tracking">{formatMessage(labels.trackingCode)}</Tab>
          <Tab id="share"> {formatMessage(labels.shareUrl)}</Tab>
          <Tab id="manage">{formatMessage(labels.manage)}</Tab>
        </TabList>
        <TabPanel id="details">
          <WebsiteEditForm websiteId={websiteId} />
        </TabPanel>
        <TabPanel id="tracking">
          <WebsiteTrackingCode websiteId={websiteId} />
        </TabPanel>
        <TabPanel id="share">
          <WebsiteShareForm websiteId={websiteId} shareId={website.shareId} />
        </TabPanel>
        <TabPanel id="manage">
          <WebsiteData websiteId={websiteId} />
        </TabPanel>
      </Tabs>
    </>
  );
}
