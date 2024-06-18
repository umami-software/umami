import { Metadata } from 'next';
import WebsitesSettingsPage from './WebsitesSettingsPage';

export default function ({ params: { teamId } }: { params: { teamId: string } }) {
  return <WebsitesSettingsPage teamId={teamId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
