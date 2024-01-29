import TeamWebsites from './TeamWebsites';
import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';

export default function TeamWebsitesPage({ params: { id } }: { params: { id: string } }) {
  return (
    <>
      <WebsitesHeader teamId={id} />
      <TeamWebsites />
    </>
  );
}
