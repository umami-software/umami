import WebsiteReports from './WebsiteReports';

export default function WebsiteReportsPage({ params: { websiteId } }) {
  if (!websiteId) {
    return null;
  }

  return <WebsiteReports websiteId={websiteId} />;
}
