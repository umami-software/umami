'use client';
import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';

export function TeamWebsites({ teamId, allowEdit }: { teamId: string; allowEdit: boolean }) {
  return <WebsitesDataTable teamId={teamId} allowEdit={allowEdit} />;
}

export default TeamWebsites;
