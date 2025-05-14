'use client';
import { ReactNode } from 'react';
import { WebsiteProvider } from './WebsiteProvider';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteHeader websiteId={websiteId} />
      {children}
    </WebsiteProvider>
  );
}
