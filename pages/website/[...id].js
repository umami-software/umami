import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DetailsPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (!id || loading) {
    return null;
  }

  const [websiteId] = id;

  return (
    <Layout header={false} footer={false}>
      <WebsiteDetails websiteId={websiteId} />
    </Layout>
  );
}
