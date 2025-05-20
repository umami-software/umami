'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { WebsiteControls } from '@/app/(main)/websites/[websiteId]/WebsiteControls';
import { WebsiteNav } from '@/app/(main)/websites/[websiteId]/WebsiteNav';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <PageBody>
        <WebsiteHeader />
        <Grid columns="auto 1fr" justifyContent="center" gap width="100%">
          <Column position="sticky" top="0px" alignSelf="flex-start" width="200px" paddingTop="3">
            <WebsiteNav websiteId={websiteId} />
          </Column>
          <Column>
            <WebsiteControls websiteId={websiteId} />
            {children}
          </Column>
        </Grid>
      </PageBody>
    </WebsiteProvider>
  );
}
