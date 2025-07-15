'use client';
import { ReactNode } from 'react';
import { Column } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <PageBody>
        <WebsiteHeader />
        <Column>{children}</Column>
      </PageBody>
    </WebsiteProvider>
  );
}
