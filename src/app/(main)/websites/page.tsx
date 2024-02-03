import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import WebsitesBrowse from './WebsitesBrowse';
import { Metadata } from 'next';

export default function WebsitesPage({ params: { teamId, userId } }) {
  return (
    <>
      <WebsitesHeader showActions={false} />
      <WebsitesBrowse teamId={teamId} userId={userId} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Websites | Umami',
};
