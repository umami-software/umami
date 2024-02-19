import WebsiteSettingsPage from './WebsiteSettingsPage';
import { Metadata } from 'next';

export default async function ({ params: { websiteId } }) {
  return <WebsiteSettingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website',
};
