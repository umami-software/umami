import React from 'react';
import Layout from 'components/layout/Layout';
import RealtimeDashboard from 'components/pages/RealtimeDashboard';
import useRequireLogin from 'hooks/useRequireLogin';

export default function RealtimePage({ settingsDisabled }) {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout settingsDisabled={settingsDisabled}>
      <RealtimeDashboard />
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
