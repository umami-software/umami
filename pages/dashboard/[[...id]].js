import React from 'react';
import Layout from 'components/layout/Layout';
import Dashboard from 'components/pages/Dashboard';
import useRequireLogin from 'hooks/useRequireLogin';
import { useRouter } from 'next/router';
import useUser from 'hooks/useUser';

export default function DashboardPage({ pageDisabled }) {
  const {
    query: { id },
    isReady,
    asPath,
  } = useRouter();
  const { loading } = useRequireLogin();
  const user = useUser();

  if (pageDisabled || !user || !isReady || loading) {
    return null;
  }

  const userId = id?.[0];

  return (
    <Layout>
      <Dashboard key={asPath} userId={user.id || userId} />
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
