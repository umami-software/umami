'use client';
import { ReactNode } from 'react';
import { Grid, Column } from '@umami/react-zen';
import { ReportsNav } from './ReportsNav';

export function ReportsLayout({ websiteId, children }: { websiteId: string; children: ReactNode }) {
  return (
    <Grid columns="200px 1fr" gap="6">
      <Column>
        <ReportsNav websiteId={websiteId} />
      </Column>
      <Column minWidth="0">{children}</Column>
    </Grid>
  );
}
