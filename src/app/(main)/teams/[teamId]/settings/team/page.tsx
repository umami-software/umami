import Team from './Team';

export default function ({ params: { teamId } }) {
  return <Team teamId={teamId} />;
}
