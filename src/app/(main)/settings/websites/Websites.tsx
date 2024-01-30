'use client';
import { useLogin } from 'components/hooks';
import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';

export default function Websites() {
  const { user } = useLogin();

  return (
    <>
      <WebsitesHeader showActions={user.role !== 'view-only'} />
      <WebsitesDataTable userId={user.id} />
    </>
  );
}
