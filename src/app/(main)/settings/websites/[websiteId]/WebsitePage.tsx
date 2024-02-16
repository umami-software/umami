'use client';
import WebsiteProvider from 'app/(main)/websites/[websiteId]/WebsiteProvider';
import WebsiteSettings from './WebsiteSettings';

export default function WebsitePage({ websiteId }: { websiteId: string }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteSettings websiteId={websiteId} />
    </WebsiteProvider>
  );
}
