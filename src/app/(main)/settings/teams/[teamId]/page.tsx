import TeamSettings from './TeamSettings';

export default function ({ params: { teamId } }) {
  return <TeamSettings teamId={teamId} />;
}
