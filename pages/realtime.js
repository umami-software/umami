import React from 'react';
import Layout from 'components/layout/Layout';
import RealtimeDashboard from 'components/pages/RealtimeDashboard';
import useRequireLogin from 'hooks/useRequireLogin';

export default function RealtimePage({ pageDisabled }) {
  const { loading } = useRequireLogin();

  if (pageDisabled || loading) {
    return null;
  }

  return (
    <Layout>
      <RealtimeDashboard />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      pageDisabled: !!process.env.DISABLE_UI,
    },
  };
}
