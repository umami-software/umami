import WebsiteHeader from '../WebsiteHeader';
import WebsiteEventData from './WebsiteEventData';

export default function ({ params: { id } }) {
  if (!id) {
    return null;
  }

  return (
    <>
      <WebsiteHeader websiteId={id} />
      <WebsiteEventData websiteId={id} />
    </>
  );
}
