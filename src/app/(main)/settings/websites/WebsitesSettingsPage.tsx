'use client';
import { useLogin } from 'components/hooks';
import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';
import { ROLES } from 'lib/constants';

export default function WebsitesSettingsPage({ teamId }: { teamId: string }) {
  const { user } = useLogin();
  const canCreate = user.role !== ROLES.viewOnly;

  return (
    <>
      <WebsitesHeader teamId={teamId} allowCreate={canCreate} />
      <WebsitesDataTable teamId={teamId} />
    </>
  );
}
