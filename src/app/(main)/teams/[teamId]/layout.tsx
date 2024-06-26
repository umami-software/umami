import TeamProvider from './TeamProvider';
import { Metadata } from 'next';
import TeamSettingsLayout from './settings/TeamSettingsLayout';

export default function ({ children, params: { teamId } }) {
  return (
    <TeamProvider teamId={teamId}>
      <TeamSettingsLayout>{children}</TeamSettingsLayout>
    </TeamProvider>
  );
}

export const metadata: Metadata = {
  title: 'Teams',
};
