import TeamSettings from './TeamSettings';
import TeamProvider from 'app/(main)/teams/[teamId]/TeamProvider';

export default function ({ params: { teamId } }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamSettings teamId={teamId} />
    </TeamProvider>
  );
}
