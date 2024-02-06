import Team from './Team';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import { Metadata } from 'next';

export default function ({ params: { teamId } }) {
  return (
    <TeamProvider teamId={teamId}>
      <Team teamId={teamId} />
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Teams Settings - Umami',
};
