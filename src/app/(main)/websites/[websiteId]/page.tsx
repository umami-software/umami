import type { Metadata } from 'next';
import { WebsitePage } from './WebsitePage';
import { WebsiteHydrator } from './WebsiteHydrator';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return (
    <>
      <WebsiteHydrator websiteId={websiteId} />
      <WebsitePage websiteId={websiteId} />
    </>
  );
}

export const metadata: Metadata = {
  title: 'Websites',
};