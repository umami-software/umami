'use client';
import WebsitesDataTable from '../settings/websites/WebsitesDataTable';
import { useLogin } from 'components/hooks';

export function WebsitesBrowse({ teamId, userId }: { teamId: string; userId: string }) {
  const { user } = useLogin();
  const allowEdit = !process.env.cloudMode;

  return <WebsitesDataTable teamId={teamId} userId={userId || user.id} allowEdit={allowEdit} />;
}

export default WebsitesBrowse;
