import { Metadata } from 'next';
import { AdminWebsitesPage } from './AdminWebsitesPage';

export default function () {
  return <AdminWebsitesPage />;
}
export const metadata: Metadata = {
  title: 'Websites',
};
