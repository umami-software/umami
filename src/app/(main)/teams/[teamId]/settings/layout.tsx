import TeamSettingsLayout from './TeamSettingsLayout';
import { Metadata } from 'next';

export default function ({ children, params: { teamId } }) {
  return <TeamSettingsLayout teamId={teamId}>{children}</TeamSettingsLayout>;
}

export const metadata: Metadata = {
  title: 'Team Settings',
};
