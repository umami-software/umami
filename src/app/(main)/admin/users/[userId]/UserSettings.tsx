import { Column, Tab, TabList, TabPanel, Tabs } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { UserEditForm } from './UserEditForm';
import { UserWebsites } from './UserWebsites';

export function UserSettings({ userId }: { userId: string }) {
  const { t, labels } = useMessages();

  return (
    <Column gap="6">
      <Tabs>
        <TabList>
          <Tab id="details">{t(labels.details)}</Tab>
          <Tab id="websites">{t(labels.websites)}</Tab>
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
