import type { Metadata } from 'next';
import { getLink } from '@/queries/prisma';
import { LinkEditPage } from './LinkEditPage';

export default async function ({ params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const link = await getLink(linkId);

  if (!link || link.deletedAt) {
    return null;
  }

  return <LinkEditPage linkId={linkId} />;
}

export const metadata: Metadata = {
  title: 'Edit Link',
};
