import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DetailsPage({ pageDisabled }) {
  const { loading } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (pageDisabled || !id || loading) {
    return null;
  }

  const [websiteId] = id;

  return (
    <Layout>
      <WebsiteDetails websiteId={websiteId} />
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
