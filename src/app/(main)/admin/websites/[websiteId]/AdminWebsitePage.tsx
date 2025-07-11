'use client';
import { WebsiteSettings } from '@/app/(main)/settings/websites/[websiteId]/WebsiteSettings';
import { WebsiteProvider } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';

export function AdminWebsitePage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteSettings websiteId={websiteId} />
    </WebsiteProvider>
  );
}
