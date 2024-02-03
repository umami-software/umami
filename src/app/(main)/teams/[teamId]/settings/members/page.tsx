import Members from './Members';

export default function ({ params: { teamId } }) {
  return <Members teamId={teamId} />;
}
