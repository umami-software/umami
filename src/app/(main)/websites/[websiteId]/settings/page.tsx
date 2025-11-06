import { SettingsPage } from './SettingsPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <SettingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Settings',
};
