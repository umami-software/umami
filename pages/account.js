import React from 'react';
import Layout from 'components/Layout';
import Account from 'components/Account';
import useRequireLogin from 'hooks/useRequireLogin';

export default function AccountPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <Account />
    </Layout>
  );
}
