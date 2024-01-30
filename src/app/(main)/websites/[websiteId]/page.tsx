import WebsiteDetails from './WebsiteDetails';

export default function WebsitePage({ params: { websiteId } }) {
  return <WebsiteDetails websiteId={websiteId} />;
}
