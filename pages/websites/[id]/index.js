import { useRouter } from 'next/router';
import Layout from 'components/layout/Layout';
import WebsiteDetails from 'components/pages/WebsiteDetails';
import useUser from 'hooks/useUser';

export default function DetailsPage() {
  const user = useUser();
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
