import { WebsitePage } from './WebsitePage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsitePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Websites',
};
