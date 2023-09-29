import WebsiteDetails from './WebsiteDetails';

export default function ({ params: { id } }) {
  if (!id) {
    return null;
  }

  return <WebsiteDetails websiteId={id} />;
}
