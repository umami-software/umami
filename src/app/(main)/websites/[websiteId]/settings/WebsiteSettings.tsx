import { Tabs, TabList, Tab, TabPanel } from '@umami/react-zen';
import { useMessages, useWebsite } from '@/components/hooks';
import { WebsiteShareForm } from './WebsiteShareForm';
import { WebsiteTrackingCode } from './WebsiteTrackingCode';
import { WebsiteData } from './WebsiteData';
import { WebsiteEditForm } from './WebsiteEditForm';

export function WebsiteSettings({ websiteId }: { websiteId: string; openExternal?: boolean }) {
  const website = useWebsite();
  const { formatMessage, labels } = useMessages();

  return (
    <Tabs>
      <TabList>
        <Tab id="details">{formatMessage(labels.details)}</Tab>
        <Tab id="tracking">{formatMessage(labels.trackingCode)}</Tab>
        <Tab id="share"> {formatMessage(labels.shareUrl)}</Tab>
        <Tab id="manage">{formatMessage(labels.manage)}</Tab>
      </TabList>
      <TabPanel id="details" style={{ width: 500 }}>
        <WebsiteEditForm websiteId={websiteId} />
      </TabPanel>
      <TabPanel id="tracking">
        <WebsiteTrackingCode websiteId={websiteId} />
      </TabPanel>
      <TabPanel id="share" style={{ width: 500 }}>
        <WebsiteShareForm websiteId={websiteId} shareId={website.shareId} />
      </TabPanel>
      <TabPanel id="manage">
        <WebsiteData websiteId={websiteId} />
      </TabPanel>
    </Tabs>
  );
}
