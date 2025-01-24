import WebsiteSettingsPage from './WebsiteSettingsPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: { websiteId: string } }) {
  const { websiteId } = await params;

  return <WebsiteSettingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website',
};
