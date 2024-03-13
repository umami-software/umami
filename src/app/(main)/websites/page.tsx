import WebsitesPage from './WebsitesPage';
import { Metadata } from 'next';

export default function ({ params: { teamId, userId } }) {
  return <WebsitesPage teamId={teamId} userId={userId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
