import type { Metadata } from 'next';
import { WebsiteLayout } from '@/app/(main)/websites/[websiteId]/WebsiteLayout';
import { getWebsite } from '@/queries/prisma';

export default async function ({
  children,
  params,
}: {
  children: any;
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;
  const website = await getWebsite(websiteId);

  if (!website || website?.deletedAt) {
    return null;
  }

  return <WebsiteLayout websiteId={websiteId}>{children}</WebsiteLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Websites | Umami',
  },
};
