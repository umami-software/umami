import WebsitesDataTable from './WebsitesDataTable';
import WebsitesHeader from './WebsitesHeader';
import { Metadata } from 'next';

export default function () {
  return (
    <>
      <WebsitesHeader />
      <WebsitesDataTable />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Websites Settings | umami',
};
