import React from 'react';
import Layout from 'components/Layout';
import Settings from 'components/Settings';
import useRequireLogin from 'hooks/useRequireLogin';

export default function SettingsPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <Settings />
    </Layout>
  );
}
