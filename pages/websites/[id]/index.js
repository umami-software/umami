import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteDetails from 'components/pages/websites/WebsiteDetails';

export default function DetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return null;
  }

  return (
    <AppLayout>
      <WebsiteDetails websiteId={id} />
    </AppLayout>
  );
}
