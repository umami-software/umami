import React from 'react';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/Dashboard';
import useRequireLogin from 'hooks/useRequireLogin';
import { useRouter } from 'next/router';
import useUser from 'hooks/useUser';

export default function DashboardPage() {
  const {
    query: { id },
    isReady,
    asPath,
  } = useRouter();
  const { loading } = useRequireLogin();
  const user = useUser();

  if (!user || !isReady || loading) {
    return null;
  }

  const userId = id?.[0];

  return (
    <Layout>
      <Dashboard key={asPath} userId={user.id || userId} />
    </Layout>
  );
}
