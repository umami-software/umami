import WebsiteDetails from './WebsiteDetails';
import { Metadata } from 'next';

export default function WebsitePage({ params: { websiteId } }) {
  return <WebsiteDetails websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
