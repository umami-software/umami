import Page from 'components/layout/Page';
import WebsiteDetails from 'app/(app)/websites/[id]/WebsiteDetails';
import useShareToken from 'components/hooks/useShareToken';

export default function SharePage({ params }) {
  const shareToken = useShareToken(params.id);

  if (!shareToken) {
    return null;
  }

  return (
    <Page>
      <WebsiteDetails websiteId={shareToken.websiteId} />
    </Page>
  );
}
