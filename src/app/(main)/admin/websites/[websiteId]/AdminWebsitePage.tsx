'use client';
import { WebsiteSettings } from '@/app/(main)/settings/websites/[websiteId]/WebsiteSettings';
import { WebsiteProvider } from '@/app/(main)/websites/[websiteId]/WebsiteProvider';
import { Panel } from '@/components/common/Panel';

export function AdminWebsitePage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Panel>
        <WebsiteSettings websiteId={websiteId} />
      </Panel>
    </WebsiteProvider>
  );
}
