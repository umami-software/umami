import type { Metadata } from 'next';
import { AdminTeamPage } from './AdminTeamPage';

export default async function ({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return <AdminTeamPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Team',
};
