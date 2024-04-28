import WebsiteDetails from './WebsiteDetails';
import { Metadata } from 'next';

export default function WebsitePage({ params: { websiteId }, searchParams }) {
  return <WebsiteDetails customDataFields={searchParams['fields']?.split(',') ?? []} websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
