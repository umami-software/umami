import TeamProvider from './TeamProvider';
import { Metadata } from 'next';

export default function ({ children, params: { teamId } }) {
  return <TeamProvider teamId={teamId}>{children}</TeamProvider>;
}

export const metadata: Metadata = {
  title: 'Teams',
};
