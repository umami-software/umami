import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';
import WebsiteDetails from 'components/WebsiteDetails';
import useUser from 'hooks/useUser';

export default function DetailsPage() {
  const { loading } = useUser();
  const router = useRouter();
  const { id } = router.query;

  if (!id || loading) {
    return null;
  }

  return (
    <Layout>
      <WebsiteDetails websiteId={+id[0]} />
    </Layout>
  );
}
