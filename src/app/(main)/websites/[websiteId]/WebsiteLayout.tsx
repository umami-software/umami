'use client';
import { Column, Grid } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteNav } from './WebsiteNav';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Grid columns={{ base: '1fr', lg: 'auto 1fr' }} width="100%">
        <Column display={{ base: 'none', lg: 'flex' }} width="240px" border="right" marginRight="2">
          <WebsiteNav websiteId={websiteId} />
        </Column>
        <PageBody gap>
          <WebsiteHeader showActions />
          <Column>{children}</Column>
        </PageBody>
      </Grid>
    </WebsiteProvider>
  );
}
