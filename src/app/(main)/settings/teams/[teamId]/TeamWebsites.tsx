import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';

export function TeamWebsites({ teamId }: { teamId: string; readOnly: boolean }) {
  return <WebsitesDataTable teamId={teamId} />;
}

export default TeamWebsites;
