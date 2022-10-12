import React from 'react';
import Layout from 'components/layout/Layout';
import Settings from 'components/pages/Settings';
import useRequireLogin from 'hooks/useRequireLogin';

export default function SettingsPage({ settingsDisabled }) {
  const { loading } = useRequireLogin();

  if (settingsDisabled || loading) {
    return null;
  }

  return (
    <Layout settingsDisabled={settingsDisabled}>
      TEST TEST TEST
      {settingsDisabled}
      <Settings />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      settingsDisabled: !!process.env.CLOUD_MODE,
    },
  };
}
