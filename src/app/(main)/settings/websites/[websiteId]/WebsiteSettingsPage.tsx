'use client';
import { Column } from '@umami/react-zen';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { WebsiteSettings } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettings';
import { WebsiteSettingsHeader } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettingsHeader';

export function WebsiteSettingsPage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Column gap="6" margin="2">
        <WebsiteSettingsHeader />
        <WebsiteSettings websiteId={websiteId} />
      </Column>
    </WebsiteProvider>
  );
}
