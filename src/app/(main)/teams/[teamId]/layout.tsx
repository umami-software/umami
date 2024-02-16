import TeamProvider from './TeamProvider';

export default function ({ children, params: { teamId } }) {
  return <TeamProvider teamId={teamId}>{children}</TeamProvider>;
}
