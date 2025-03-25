import WebsiteDetailsPage from './WebsiteDetailsPage';
import { Metadata } from 'next';

export default async function WebsitePage({ params }: { params: { websiteId: string } }) {
  const { websiteId } = await params;

  return <WebsiteDetailsPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
