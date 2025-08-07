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
      <Grid columns="auto 1fr" width="100%" height="100%">
        <Column height="100%" border="right" backgroundColor>
          <WebsiteNav websiteId={websiteId} />
        </Column>
        <PageBody gap>
          <WebsiteHeader />
          <Column>{children}</Column>
        </PageBody>
      </Grid>
    </WebsiteProvider>
  );
}
