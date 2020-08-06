import React from 'react';
import Layout from 'components/Layout';
import WebsiteList from 'components/WebsiteList';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DashboardPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <WebsiteList />
    </Layout>
  );
}
