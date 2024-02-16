import WebsiteReportsPage from './WebsiteReportsPage';

export default function ({ params: { websiteId } }) {
  return <WebsiteReportsPage websiteId={websiteId} />;
}
