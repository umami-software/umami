import TeamSettings from './TeamSettings';

export default function ({ children, params: { teamId } }) {
  return <TeamSettings teamId={teamId}>{children}</TeamSettings>;
}
