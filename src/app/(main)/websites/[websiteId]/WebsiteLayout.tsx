'use client';
import { ReactNode } from 'react';
import { Column } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteTabs } from './WebsiteTabs';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <PageBody>
        <WebsiteHeader />
        <WebsiteTabs />
        <Column>{children}</Column>
      </PageBody>
    </WebsiteProvider>
  );
}
