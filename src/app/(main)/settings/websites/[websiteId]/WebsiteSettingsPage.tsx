'use client';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { WebsiteSettings } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettings';
import { WebsiteSettingsHeader } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettingsHeader';

export function WebsiteSettingsPage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteSettingsHeader />
      <WebsiteSettings websiteId={websiteId} />
    </WebsiteProvider>
  );
}
