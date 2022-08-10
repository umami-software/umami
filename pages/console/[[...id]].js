import React from 'react';
import Layout from 'components/layout/Layout';
import TestConsole from 'components/pages/TestConsole';
import useRequireLogin from 'hooks/useRequireLogin';
import useUser from 'hooks/useUser';

export default function ConsolePage({ enabled }) {
  const { loading } = useRequireLogin();
  const { user } = useUser();

  if (loading || !enabled || !user?.is_admin) {
    return null;
  }

  return (
    <Layout>
      <TestConsole />
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: { enabled: !!process.env.ENABLE_TEST_CONSOLE },
  };
}
