import WebsiteReports from './WebsiteReports';

export default function WebsiteReportsPage({ params: { id } }) {
  if (!id) {
    return null;
  }

  return <WebsiteReports websiteId={id} />;
}
