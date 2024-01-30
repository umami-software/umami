import Realtime from './Realtime';

export default function WebsiteRealtimePage({ params: { websiteId } }) {
  if (!websiteId) {
    return null;
  }

  return <Realtime websiteId={websiteId} />;
}
