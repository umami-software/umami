import React from 'react';
import Layout from 'components/layout/Layout';
import Settings from 'components/pages/Settings';
import useRequireLogin from 'hooks/useRequireLogin';
import { SHOW_HEADER, SHOW_FOOTER } from 'lib/constants';

export default function SettingsPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout header={SHOW_HEADER} footer={SHOW_FOOTER}>
      <Settings />
    </Layout>
  );
}
