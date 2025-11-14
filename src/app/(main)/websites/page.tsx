import { WebsitesPage } from './WebsitesPage';
import { Metadata } from 'next';

export default function () {
  return <WebsitesPage />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
