import { useRouter } from 'next/router';
import ShareLayout from 'components/layout/ShareLayout';
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
    <ShareLayout>
      <WebsiteDetails websiteId={shareToken.websiteId} />
    </ShareLayout>
  );
}
