import React from 'react';
import Layout from 'components/layout/Layout';
import Settings from 'components/pages/Settings';
import useRequireLogin from 'hooks/useRequireLogin';

export default function SettingsPage({ pageDisabled }) {
  const { loading } = useRequireLogin();

  if (pageDisabled || loading) {
    return null;
  }

  return (
    <Layout>
      <Settings />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!process.env.DISABLE_UI || !!process.env.isAdminDisabled,
    },
  };
}
