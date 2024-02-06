import TeamSettingsLayout from './TeamSettingsLayout';

export default function ({ children, params: { teamId } }) {
  return <TeamSettingsLayout teamId={teamId}>{children}</TeamSettingsLayout>;
}
