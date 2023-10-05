import WebsiteSettings from '../WebsiteSettings';

export default async function WebsiteSettingsPage({ params: { id } }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <WebsiteSettings websiteId={id} />;
}
