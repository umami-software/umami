import TeamSettings from './TeamSettings';

export default function ({ params: { teamId } }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <TeamSettings teamId={teamId} />;
}
