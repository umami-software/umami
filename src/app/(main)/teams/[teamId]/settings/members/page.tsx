import { Metadata } from 'next';
import TeamMembersPage from './TeamMembersPage';

export default async function ({ params }: { params: { teamId: string } }) {
  const { teamId } = await params;

  return <TeamMembersPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Team Members',
};
