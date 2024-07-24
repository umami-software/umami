import TeamWebsitesPage from './TeamWebsitesPage';
import { Metadata } from 'next';

export default function ({ params: { teamId } }) {
  return <TeamWebsitesPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Teams Websites',
};
