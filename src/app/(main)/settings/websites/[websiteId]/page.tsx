import WebsiteSettings from '../WebsiteSettings';

export default async function WebsiteSettingsPage({ params: { websiteId } }) {
  return <WebsiteSettings websiteId={websiteId} />;
}
