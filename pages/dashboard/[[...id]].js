import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/Dashboard';
import useRequireLogin from 'hooks/useRequireLogin';
import useUser from 'hooks/useUser';
import useConfig from 'hooks/useConfig';

export default function DashboardPage() {
  const {
    query: { id },
    isReady,
    asPath,
  } = useRouter();
  const { loading } = useRequireLogin();
  const user = useUser();
  const { adminDisabled } = useConfig();

  if (adminDisabled || !user || !isReady || loading) {
    return null;
  }

  const userId = id?.[0];

  return (
    <Layout>
      <Dashboard key={asPath} userId={user.id || userId} />
    </Layout>
  );
}
