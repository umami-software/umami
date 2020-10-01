import React from 'react';
import Layout from 'components/layout/Layout';
import TestConsole from 'components/pages/TestConsole';
import useRequireLogin from 'hooks/useRequireLogin';

export default function TestPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <TestConsole />
    </Layout>
  );
}
