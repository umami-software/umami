import { Metadata } from 'next';
import { TeamSettingsPage } from './TeamSettingsPage';

export default async function ({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return <TeamSettingsPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Teams',
};
