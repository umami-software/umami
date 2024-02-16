'use client';
import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';

export default function WebsitesPage({ teamId, userId }: { teamId: string; userId: string }) {
  return (
    <>
      <WebsitesHeader teamId={teamId} />
      <WebsitesDataTable teamId={teamId} userId={userId} allowEdit={false} />
    </>
  );
}
