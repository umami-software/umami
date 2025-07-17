'use client';
import { ReactNode } from 'react';
import { Column, Grid } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Grid columns="200px 1fr" gap width="100%">
        <Column padding>
          <WebsiteNav websiteId={websiteId} />
        </Column>
        <PageBody>
          <Column gap>
            <WebsiteHeader />
            <Column>{children}</Column>
          </Column>
        </PageBody>
      </Grid>
    </WebsiteProvider>
  );
}
