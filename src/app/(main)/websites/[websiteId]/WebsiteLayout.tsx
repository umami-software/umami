'use client';
import { ReactNode } from 'react';
import { Grid, Column, Box } from '@umami/react-zen';
import { WebsiteProvider } from './WebsiteProvider';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsiteTabs } from '@/app/(main)/websites/[websiteId]/WebsiteTabs';

export function WebsiteLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <WebsiteProvider websiteId={websiteId}>
      <WebsiteHeader websiteId={websiteId} />
      <Grid columns="170px 1140px" justifyContent="center" gap>
        <Box position="sticky" top="20px" alignSelf="flex-start">
          <WebsiteTabs websiteId={websiteId} />
        </Box>
        <Column>{children}</Column>
      </Grid>
    </WebsiteProvider>
  );
}
