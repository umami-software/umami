import React from 'react';
import Layout from 'components/Layout';
import Settings from 'components/Settings';
import useUser from 'hooks/useUser';

export default function SettingsPage() {
  const { loading } = useUser();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <Settings />
    </Layout>
  );
}
