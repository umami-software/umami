import type { Metadata } from 'next';
import { OutboundLinksPage } from './OutboundLinksPage';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <OutboundLinksPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Outbound Links',
};
