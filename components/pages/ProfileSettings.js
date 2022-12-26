import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from 'components/settings/ProfileDetails';
import { useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';
import UserPasswordForm from 'components/forms/UserPasswordForm';

export default function ProfileSettings() {
  const [tab, setTab] = useState('general');
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: 'Saved successfully.', variant: 'success' });
  };

  return (
    <Page>
      {toast}
      <PageHeader>
        <Breadcrumbs>
          <Item>Profile</Item>
        </Breadcrumbs>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="general">General</Item>
        <Item key="password">Password</Item>
      </Tabs>
      {tab === 'general' && <ProfileDetails />}
      {tab === 'password' && <UserPasswordForm onSave={handleSave} />}
    </Page>
  );
}
