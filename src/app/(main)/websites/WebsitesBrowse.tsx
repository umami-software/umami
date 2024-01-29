'use client';
import WebsitesDataTable from '../settings/websites/WebsitesDataTable';
import { useLogin } from 'components/hooks';

export function WebsitesBrowse() {
  const { user } = useLogin();
  const allowEdit = !process.env.cloudMode;

  return <WebsitesDataTable userId={user.id} allowEdit={allowEdit} />;
}

export default WebsitesBrowse;
