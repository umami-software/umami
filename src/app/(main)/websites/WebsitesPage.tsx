'use client';
import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';

export default function WebsitesPage({ teamId }: { teamId: string }) {
  return (
    <>
      <WebsitesHeader teamId={teamId} allowCreate={false} />
      <WebsitesDataTable teamId={teamId} allowEdit={false} />
    </>
  );
}
