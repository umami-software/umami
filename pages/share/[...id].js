import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/WebsiteDetails';
import useFetch from 'hooks/useFetch';

export default function SharePage() {
  const router = useRouter();
  const { id } = router.query;
  const shareId = id?.[0];
  const { data } = useFetch(shareId ? `/api/share/${shareId}` : null);

  if (!data) {
    return null;
  }

  const { websiteId, token } = data;

  return (
    <Layout>
      <WebsiteDetails websiteId={websiteId} token={token} />
    </Layout>
  );
}
