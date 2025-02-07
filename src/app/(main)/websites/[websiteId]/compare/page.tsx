import WebsiteComparePage from './WebsiteComparePage';
import { Metadata } from 'next';

export default async function ({ params }: { params: { websiteId: string } }) {
  const { websiteId } = await params;

  return <WebsiteComparePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Website Comparison',
};
