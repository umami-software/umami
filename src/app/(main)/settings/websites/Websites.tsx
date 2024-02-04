'use client';
import { useLogin } from 'components/hooks';
import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';

export default function Websites({ teamId }: { teamId: string }) {
  const { user } = useLogin();

  return (
    <>
      <WebsitesHeader teamId={teamId} showActions={user.role !== 'view-only'} />
      <WebsitesDataTable teamId={teamId} userId={user.id} allowEdit={true} />
    </>
  );
}
