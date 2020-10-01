import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteList from 'components/pages/WebsiteList';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DashboardPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;
  const userId = id?.[0];

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <WebsiteList userId={userId} />
    </Layout>
  );
}
