import { Column, Tabs, Tab, TabList, TabPanel } from '@umami/react-zen';
import { UserEditForm } from './UserEditForm';
import { useMessages } from '@/components/hooks';
import { UserWebsites } from './UserWebsites';

export function UserSettings({ userId }: { userId: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <Column gap="6">
      <Tabs>
        <TabList>
          <Tab id="details">{formatMessage(labels.details)}</Tab>
          <Tab id="websites">{formatMessage(labels.websites)}</Tab>
        </TabList>
        <TabPanel id="details" style={{ width: 500 }}>
          <UserEditForm userId={userId} />
        </TabPanel>
        <TabPanel id="websites">
          <UserWebsites userId={userId} />
        </TabPanel>
      </Tabs>
    </Column>
  );
}
