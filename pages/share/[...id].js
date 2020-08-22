import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/WebsiteDetails';
import NotFound from 'pages/404';
import { get } from 'lib/web';

export default function SharePage() {
  const [loading, setLoading] = useState(true);
  const [websiteId, setWebsiteId] = useState();
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  async function loadData() {
    const website = await get(`/api/share/${id?.[0]}`);

    if (website) {
      setWebsiteId(website.website_id);
    } else if (typeof window !== 'undefined') {
      setNotFound(true);
    }
  }

  useEffect(() => {
    if (id) {
      loadData().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return null;

  if (!id || notFound) {
    return <NotFound />;
  }

  return (
    <Layout>
      <WebsiteDetails websiteId={websiteId} />
    </Layout>
  );
}
