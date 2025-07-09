import { AdminTeamPage } from './AdminTeamPage';
import { TeamProvider } from '@/app/(main)/teams/[teamId]/TeamProvider';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  return (
    <TeamProvider teamId={teamId}>
      <AdminTeamPage teamId={teamId} />
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Team',
};
