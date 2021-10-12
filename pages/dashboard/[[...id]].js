import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteList from 'components/pages/WebsiteList';
import useRequireLogin from 'hooks/useRequireLogin';
import { SHOW_HEADER, SHOW_FOOTER } from 'lib/constants';

export default function DashboardPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;
  const userId = id?.[0];

  if (loading) {
    return null;
  }

  return (
    <Layout header={SHOW_HEADER} footer={SHOW_FOOTER}>
      <WebsiteList userId={userId} />
    </Layout>
  );
}
