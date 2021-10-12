import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useRequireLogin from 'hooks/useRequireLogin';
import { SHOW_HEADER, SHOW_FOOTER } from 'lib/constants';

export default function DetailsPage() {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (!id || loading) {
    return null;
  }

  const [websiteId] = id;

  return (
    <Layout header={SHOW_HEADER} footer={SHOW_FOOTER}>
      <WebsiteDetails websiteId={websiteId} />
    </Layout>
  );
}
