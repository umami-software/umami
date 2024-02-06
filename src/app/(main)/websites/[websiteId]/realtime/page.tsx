import WebsiteRealtimePage from './WebsiteRealtimePage';

export default function ({ params: { websiteId } }) {
  return <WebsiteRealtimePage websiteId={websiteId} />;
}
