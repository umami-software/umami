'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <PageBody>
        <Column gap="6">
          <WebsiteHeader />
          <Grid columns="auto 1fr" justifyContent="center" gap="6" width="100%">
            <Column position="sticky" top="20px" alignSelf="flex-start" width="200px">
              <WebsiteNav websiteId={websiteId} />
            </Column>
            <Column>{children}</Column>
          </Grid>
        </Column>
      </PageBody>
    </WebsiteProvider>
  );
}
