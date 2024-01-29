'use client';
import { Key, useState } from 'react';
import { Item, Loading, Tabs } from 'react-basics';
import UserEditForm from '../UserEditForm';
import PageHeader from 'components/layout/PageHeader';
import { useMessages, useUser } from 'components/hooks';
import UserWebsites from './UserWebsites';

export function UserSettings({ userId }: { userId: string }) {
  const { formatMessage, labels } = useMessages();
  const [tab, setTab] = useState<Key>('details');
  const { data: user, isLoading } = useUser(userId, { gcTime: 0 });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={user?.username} />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
      </Tabs>
      {tab === 'details' && <UserEditForm userId={userId} data={user} />}
      {tab === 'websites' && <UserWebsites userId={userId} />}
    </>
  );
}

export default UserSettings;
