'use client';
import WebsiteDetails from '../../(main)/websites/[id]/WebsiteDetails';
import useShareToken from 'components/hooks/useShareToken';

export default function ({ shareId }) {
  const shareToken = useShareToken(shareId);

  if (!shareToken) {
    return null;
  }

  return <WebsiteDetails websiteId={shareToken.websiteId} />;
}
