import TeamMembersPage from './TeamMembersPage';
import { Metadata } from 'next';

export default function ({ params: { teamId } }) {
  return <TeamMembersPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Team Members',
};
