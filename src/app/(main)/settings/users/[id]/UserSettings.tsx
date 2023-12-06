'use client';
import { Key, useEffect, useState } from 'react';
import { Item, Loading, Tabs, useToasts } from 'react-basics';
import UserEditForm from '../UserEditForm';
import PageHeader from 'components/layout/PageHeader';
import useApi from 'components/hooks/useApi';
import useMessages from 'components/hooks/useMessages';
import UserWebsites from '../UserWebsites';

export function UserSettings({ userId }) {
  const { formatMessage, labels, messages } = useMessages();
  const [edit, setEdit] = useState(false);
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState<Key>('details');
  const { get, useQuery } = useApi();
  const { showToast } = useToasts();
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => {
      if (userId) {
        return get(`/users/${userId}`);
      }
    },
    gcTime: 0,
  });

  const handleSave = (data: any) => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    if (data) {
      setValues(state => ({ ...state, ...data }));
    }

    if (edit) {
      setEdit(false);
    }
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  if (isLoading || !values) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title={values?.username} />
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">{formatMessage(labels.details)}</Item>
        <Item key="websites">{formatMessage(labels.websites)}</Item>
      </Tabs>
      {tab === 'details' && <UserEditForm userId={userId} data={values} onSave={handleSave} />}
      {tab === 'websites' && <UserWebsites userId={userId} />}
    </>
  );
}

export default UserSettings;
