import WebsiteDetailsPage from './WebsiteDetailsPage';
import { Metadata } from 'next';

export default function WebsitePage({ params: { websiteId } }) {
  return <WebsiteDetailsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
