import { Metadata } from 'next';
import { WebsitesSettingsPage } from './WebsitesSettingsPage';

export default async function ({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return <WebsitesSettingsPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
