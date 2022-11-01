import React from 'react';
import Layout from 'components/layout/Layout';
import Settings from 'components/pages/Settings';
import useRequireLogin from 'hooks/useRequireLogin';
import useConfig from 'hooks/useConfig';

export default function SettingsPage() {
  const { loading } = useRequireLogin();
  const { adminDisabled } = useConfig();

  if (adminDisabled || loading) {
    return null;
  }

  return (
    <Layout>
      <Settings />
    </Layout>
  );
}
