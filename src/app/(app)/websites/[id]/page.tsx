import WebsiteDetails from './WebsiteDetails';

export default function WebsiteReportsPage({ params: { id } }) {
  return <WebsiteDetails websiteId={id} />;
}
