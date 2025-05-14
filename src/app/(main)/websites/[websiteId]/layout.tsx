import { Metadata } from 'next';
import { WebsiteLayout } from '@/app/(main)/websites/[websiteId]/WebsiteLayout';

export default async function ({
  children,
  params,
}: {
  children: any;
  params: Promise<{ websiteId: string }>;
}) {
  const { websiteId } = await params;

  return <WebsiteLayout websiteId={websiteId}>{children}</WebsiteLayout>;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Umami',
    default: 'Websites | Umami',
  },
};
