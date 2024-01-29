import WebsiteDetails from './WebsiteDetails';

export default function WebsitePage({ params: { id } }) {
  return <WebsiteDetails websiteId={id} />;
}
