import WebsiteSettings from '../WebsiteSettings';

async function getDisabled() {
  return !!process.env.CLOUD_MODE;
}

export default async function WebsiteSettingsPage({ params }) {
  const disabled = await getDisabled();

  if (!params.id || disabled) {
    return null;
  }

  return <WebsiteSettings websiteId={params.id} />;
}
