import React from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useShareToken from 'hooks/useShareToken';

export default function SharePage({ pageDisabled }) {
  const router = useRouter();
  const { id } = router.query;
  const shareId = id?.[0];
  const shareToken = useShareToken(shareId);

  if (pageDisabled || !shareToken) {
    return null;
  }

  return (
    <Layout>
      <WebsiteDetails websiteId={shareToken.id} />
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
