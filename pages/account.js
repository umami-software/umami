import React from 'react';
import Layout from 'components/layout/Layout';
import AccountSettings from 'components/settings/AccountSettings';
import useRequireLogin from 'hooks/useRequireLogin';

export default function AccountPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <AccountSettings />
    </Layout>
  );
}
