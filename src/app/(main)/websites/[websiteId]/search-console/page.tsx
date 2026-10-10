import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SearchConsolePage } from './SearchConsolePage';

export default async function Page({ params }: { params: Promise<{ websiteId: string }> }) {
  // Google Search Console is a Cloud integration.
  if (!process.env.cloudMode) {
    notFound();
  }

  const { websiteId } = await params;

  return <SearchConsolePage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Searches',
};
