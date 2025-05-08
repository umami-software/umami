import WebsiteRealtimePage from './WebsiteRealtimePage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <WebsiteRealtimePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Real-time',
};
