import WebsiteDetails from '../../../../websites/[websiteId]/WebsiteDetails';

export default function TeamWebsitePage({ params: { websiteId } }) {
  return <WebsiteDetails websiteId={websiteId} />;
}
