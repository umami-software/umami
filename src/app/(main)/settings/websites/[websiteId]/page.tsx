import WebsiteSettings from '../WebsiteSettings';

export default async function WebsiteSettingsPage({ params: { websiteId } }) {
  if (process.env.cloudMode || !websiteId) {
    return null;
  }

  return <WebsiteSettings websiteId={websiteId} />;
}
