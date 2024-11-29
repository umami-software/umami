import TeamWebsitesPage from './TeamWebsitesPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: { teamId: string } }) {
  const { teamId } = await params;

  return <TeamWebsitesPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Teams Websites',
};
