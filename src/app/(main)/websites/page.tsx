import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import Websites from './Websites';
import { Metadata } from 'next';

export default function WebsitesPage({ params: { teamId, userId } }) {
  return (
    <>
      <WebsitesHeader teamId={teamId} />
      <Websites teamId={teamId} userId={userId} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Websites | Umami',
};
