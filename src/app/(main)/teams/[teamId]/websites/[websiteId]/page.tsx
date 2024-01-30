import WebsiteDetails from 'app/(main)/websites/[websiteId]/WebsiteDetails';

export default function TeamWebsitePage({ params: { websiteId } }) {
  return <WebsiteDetails websiteId={websiteId} />;
}
