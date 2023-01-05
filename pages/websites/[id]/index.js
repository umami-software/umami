import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useRequireLogin from 'hooks/useRequireLogin';

export default function DetailsPage() {
  const { user } = useRequireLogin();
  const router = useRouter();
  const { id } = router.query;

  if (!id || !user) {
    return null;
  }

  return (
    <Layout>
      <WebsiteDetails websiteId={id} />
    </Layout>
  );
}
