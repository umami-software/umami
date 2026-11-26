import type { Metadata } from 'next';
import { getLink } from '@/queries/prisma';
import { LinkMetricsPage } from './LinkMetricsPage';

export default async function ({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const link = await getLink(linkId);

  if (!link || link?.deletedAt) {
    return null;
  }

  return <LinkMetricsPage linkId={linkId} />;
}

export const metadata: Metadata = {
  title: 'Link',
};
