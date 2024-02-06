import TeamWebsites from './TeamWebsites';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';
import { Metadata } from 'next';

export default function ({ params: { teamId } }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamWebsites teamId={teamId} />
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Teams websites - Umami',
};
