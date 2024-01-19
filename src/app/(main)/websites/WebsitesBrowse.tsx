'use client';
import WebsitesDataTable from '../settings/websites/WebsitesDataTable';
import { useUser } from 'components/hooks';

export function WebsitesBrowse() {
  const { user } = useUser();
  const allowEdit = !process.env.cloudMode;

  return <WebsitesDataTable userId={user.id} allowEdit={allowEdit} />;
}

export default WebsitesBrowse;
