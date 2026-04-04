import type { Metadata } from 'next';
import { SettingsPage } from './SettingsPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <SettingsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Settings',
};
