import React from 'react';
import Layout from 'components/layout/Layout';
import RealtimeDashboard from 'components/pages/RealtimeDashboard';
import useRequireLogin from 'hooks/useRequireLogin';

export default function RealtimePage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <RealtimeDashboard />
    </Layout>
  );
}
