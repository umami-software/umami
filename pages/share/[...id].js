import { useRouter } from 'next/router';
import AppLayout from 'components/layout/AppLayout';
import WebsiteDetails from 'components/pages/websites/WebsiteDetails';
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
    <AppLayout>
      <WebsiteDetails websiteId={shareToken.websiteId} />
    </AppLayout>
  );
}
