import React from 'react';
import Layout from 'components/layout/Layout';
import TestConsole from 'components/pages/TestConsole';
import useRequireLogin from 'hooks/useRequireLogin';
import useUser from 'hooks/useUser';
import { ROLES } from 'lib/constants';

export default function ConsolePage({ pageDisabled }) {
  const { loading } = useRequireLogin();
  const { user } = useUser();

  if (pageDisabled || loading || user?.role !== ROLES.admin) {
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
    props: {
      pageDisabled: !process.env.ENABLE_TEST_CONSOLE,
    },
  };
}
