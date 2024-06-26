import { Metadata } from 'next';
import TeamPage from './TeamPage';

export default function ({ params: { teamId } }) {
  return <TeamPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Teams Details',
};
