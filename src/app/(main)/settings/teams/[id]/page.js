import TeamSettings from './TeamSettings';

export default function ({ params }) {
  if (process.env.cloudMode) {
    return null;
  }

  return <TeamSettings teamId={params.id} />;
}
