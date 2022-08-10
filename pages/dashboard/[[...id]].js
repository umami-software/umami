import React from 'react';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/Dashboard';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DashboardPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}
