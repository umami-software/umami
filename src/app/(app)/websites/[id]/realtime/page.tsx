import Realtime from './Realtime';

export default function WebsiteRealtimePage({ params: { id } }) {
  if (!id) {
    return null;
  }

  return <Realtime websiteId={id} />;
}
