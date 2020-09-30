import React from 'react';
import Layout from 'components/layout/Layout';
import Settings from 'components/pages/Settings';
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
