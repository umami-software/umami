'use client';
import { ReactNode } from 'react';
import { Column, Grid } from '@umami/react-zen';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { useNavigation } from '@/components/hooks';
import { PageBody } from '@/components/common/PageBody';
import { WebsiteHeader } from './WebsiteHeader';
import { WebsiteNav } from './WebsiteNav';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  const { pathname } = useNavigation();

  const isSettings = pathname.endsWith('/settings');

  return (
    <WebsiteProvider websiteId={websiteId}>
      <Grid columns={isSettings ? '1fr' : 'auto 1fr'} width="100%" height="100%">
        {!isSettings && (
          <Column height="100%" border="right" backgroundColor marginRight="2">
            <WebsiteNav websiteId={websiteId} />
          </Column>
        )}
        <PageBody gap>
          <WebsiteHeader />
          <Column>{children}</Column>
        </PageBody>
      </Grid>
    </WebsiteProvider>
  );
}
