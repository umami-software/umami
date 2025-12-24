'use client';
import { WebsiteSettings } from '@/app/(main)/websites/[websiteId]/settings/WebsiteSettings';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
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
