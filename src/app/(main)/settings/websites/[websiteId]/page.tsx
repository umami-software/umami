import WebsiteProvider from 'app/(main)/websites/[websiteId]/WebsiteProvider';
import WebsiteSettings from './WebsiteSettings';

export default async function WebsiteSettingsPage({ params: { websiteId } }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteSettings websiteId={websiteId} />
    </WebsiteProvider>
  );
}
