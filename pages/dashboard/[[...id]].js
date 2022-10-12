import React from 'react';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/Dashboard';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DashboardPage({ settingsDisabled }) {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout settingsDisabled={settingsDisabled}>
      <Dashboard />
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
