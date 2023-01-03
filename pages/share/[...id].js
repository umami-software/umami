import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useShareToken from 'hooks/useShareToken';

export default function SharePage() {
  const router = useRouter();
  const { id } = router.query;
  const shareId = id?.[0];
  const shareToken = useShareToken(shareId);

  if (!shareToken) {
    return null;
  }

  return (
    <Layout>
      <WebsiteDetails websiteId={shareToken.websiteId} />
    </Layout>
  );
}
