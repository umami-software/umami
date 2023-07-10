import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteReportsPage from 'components/pages/websites/WebsiteReportsPage';

export default function () {
  const router = useRouter();
  const { id: websiteId } = router.query;

  if (!websiteId) {
    return null;
  }

  return (
    <AppLayout>
      <WebsiteReportsPage websiteId={websiteId} />
    </AppLayout>
  );
}
