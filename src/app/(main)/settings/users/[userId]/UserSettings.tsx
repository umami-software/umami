import { Key, useContext, useState } from 'react';
import { Item, Tabs, useToasts } from 'react-basics';
import Icons from '@/components/icons';
import UserEditForm from './UserEditForm';
import PageHeader from '@/components/layout/PageHeader';
import { useMessages } from '@/components/hooks';
import UserWebsites from './UserWebsites';
import { UserContext } from './UserProvider';
import Breadcrumb from '@/components/common/Breadcrumb';

export function UserSettings({ userId }: { userId: string }) {
  const { formatMessage, labels, messages } = useMessages();
  const [tab, setTab] = useState<Key>('details');
  const user = useContext(UserContext);
  const { showToast } = useToasts();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const breadcrumb = (
    <Breadcrumb
      data={[
        {
          label: formatMessage(labels.users),
          url: '/settings/users',
        },
        {
          label: user.username,
        },
      ]}
    />
  );

  return (
    <>
      <PageHeader title={user?.username} icon={<Icons.User />} breadcrumb={breadcrumb} />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
      </Tabs>
      {tab === 'details' && <UserEditForm userId={userId} onSave={handleSave} />}
      {tab === 'websites' && <UserWebsites userId={userId} />}
    </>
  );
}

export default UserSettings;
