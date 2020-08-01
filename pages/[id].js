import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/Layout';
import WebsiteDetails from '../components/WebsiteDetails';

export default function DetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <WebsiteDetails websiteId={id} />
    </Layout>
  );
}
