import React from 'react';
import Layout from 'components/layout/Layout';
import Test from 'components/pages/Test';
import useRequireLogin from 'hooks/useRequireLogin';

export default function TestPage() {
  const { loading } = useRequireLogin();

  if (loading) {
    return null;
  }

  return (
    <Layout>
      <Test />
    </Layout>
  );
}
