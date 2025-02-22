import { useContext } from 'react';
import { Tabs, Tab, TabList, TabPanel } from '@umami/react-zen';
import { Icons } from '@/components/icons';
import { UserEditForm } from './UserEditForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMessages } from '@/components/hooks';
import { UserWebsites } from './UserWebsites';
import { UserContext } from './UserProvider';

export function UserSettings({ userId }: { userId: string }) {
  const { formatMessage, labels } = useMessages();
  const user = useContext(UserContext);

  return (
    <>
      <PageHeader title={user?.username} icon={<Icons.User />} />
      <Tabs>
        <TabList>
          <Tab id="details">{formatMessage(labels.details)}</Tab>
          <Tab id="websites">{formatMessage(labels.websites)}</Tab>
        </TabList>
        <TabPanel id="details">
          <UserEditForm userId={userId} />
        </TabPanel>
        <TabPanel id="websites">
          <UserWebsites userId={userId} />
        </TabPanel>
      </Tabs>
    </>
  );
}
