'use client';
import { ReactNode } from 'react';
import { Column, Grid } from '@umami/react-zen';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteNav } from './WebsiteNav';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <Grid columns={{ xs: '1fr', lg: 'auto 1fr' }} width="100%" height="100%">
        <Column
          display={{ xs: 'none', lg: 'flex' }}
          width="240px"
          height="100%"
          border="right"
          backgroundColor
          marginRight="2"
        >
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
