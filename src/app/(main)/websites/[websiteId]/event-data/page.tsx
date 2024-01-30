import WebsiteHeader from '../WebsiteHeader';
import WebsiteEventData from './WebsiteEventData';

export default function WebsiteEventDataPage({ params: { websiteId } }) {
  if (!websiteId) {
    return null;
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <WebsiteEventData websiteId={websiteId} />
    </>
  );
}
