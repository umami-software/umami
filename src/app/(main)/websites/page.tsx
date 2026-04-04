import type { Metadata } from 'next';
import { WebsitesPage } from './WebsitesPage';

export default function () {
  return <WebsitesPage />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
