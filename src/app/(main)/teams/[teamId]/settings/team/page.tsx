import { Metadata } from 'next';
import TeamPage from './TeamPage';

export default async function ({ params }: { params: { teamId: string } }) {
  const { teamId } = await params;

  return <TeamPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Teams Details',
};
