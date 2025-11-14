import { Metadata } from 'next';
import { WebsiteSettingsPage } from '@/app/(main)/settings/websites/[websiteId]/WebsiteSettingsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsiteSettingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website',
};
