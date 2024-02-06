import TeamMembers from './TeamMembers';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import { Metadata } from 'next';

export default function ({ params: { teamId } }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamMembers teamId={teamId} />
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Team members - Umami',
};
