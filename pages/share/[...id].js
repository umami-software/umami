import { useRouter } from 'next/router';
import ShareLayout from 'components/layout/ShareLayout';
import WebsiteDetailsPage from 'components/pages/websites/WebsiteDetailsPage';
import useShareToken from 'hooks/useShareToken';

export default function () {
  const router = useRouter();
  const { id } = router.query;
  const shareId = id?.[0];
  const shareToken = useShareToken(shareId);

  if (!shareToken) {
    return null;
  }

  return (
    <ShareLayout>
      <WebsiteDetailsPage websiteId={shareToken.websiteId} />
    </ShareLayout>
  );
}
