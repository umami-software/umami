import WebsiteHeader from '../WebsiteHeader';
import WebsiteMetricsBar from '../WebsiteMetricsBar';

export function WebsiteComparePage({ websiteId }) {
  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteMetricsBar websiteId={websiteId} />
    </>
  );
}

export default WebsiteComparePage;
