'use client';
import WebsitesHeader from 'app/(main)/settings/websites/WebsitesHeader';
import WebsitesDataTable from 'app/(main)/settings/websites/WebsitesDataTable';
import { useLogin } from 'components/hooks';

export default function WebsitesPage({ teamId }: { teamId: string; userId: string }) {
  const { user } = useLogin();

  return (
    <>
      <WebsitesHeader teamId={teamId} allowCreate={user.role !== 'view-only'} />
      <WebsitesDataTable teamId={teamId} allowEdit={false} />
    </>
  );
}
