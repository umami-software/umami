import { AdminTeamPage } from './AdminTeamPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return <AdminTeamPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Team',
};
