'use client';
import { useUser } from 'components/hooks';
import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';

export default function Websites() {
  const { user } = useUser();

  return (
    <>
      <WebsitesHeader />
      <WebsitesDataTable userId={user.id} />
    </>
  );
}
