import { Metadata } from 'next';
import WebsitesPage from './WebsitesPage';

export default function ({ params: { teamId } }: { params: { teamId: string } }) {
  return <WebsitesPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
