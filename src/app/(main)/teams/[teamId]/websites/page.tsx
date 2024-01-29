import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';
import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';

export default function TeamWebsitesPage({ params: { teamId } }: { params: { teamId: string } }) {
  return (
    <>
      <WebsitesHeader teamId={teamId} />
      <WebsitesDataTable teamId={teamId} />
    </>
  );
}
