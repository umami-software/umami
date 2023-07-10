import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteReports from 'components/pages/websites/WebsiteReports';

export default function () {
  const router = useRouter();
  const { id: websiteId } = router.query;

  if (!websiteId) {
    return null;
  }

  return (
    <AppLayout>
      <WebsiteReports websiteId={websiteId} />
    </AppLayout>
  );
}
