'use client';
import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';

export default function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  return (
    <>
      <WebsitesHeader teamId={teamId} />
      <WebsitesDataTable teamId={teamId} />
    </>
  );
}
