import WebsiteDetails from 'app/(main)/websites/[id]/WebsiteDetails';

export default function TeamWebsitePage({ params: { websiteId } }) {
  return <WebsiteDetails websiteId={websiteId} />;
}
