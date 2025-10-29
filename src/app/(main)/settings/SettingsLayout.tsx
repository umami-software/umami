'use client';
import { PageBody } from '@/components/common/PageBody';
import { Column, Grid } from '@umami/react-zen';
import { ReactNode } from 'react';
import { SettingsNav } from './SettingsNav';

export function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Grid columns={{ xs: '1fr', lg: 'auto 1fr' }} width="100%" height="100%">
      <Column
        display={{ xs: 'none', lg: 'flex' }}
        width="240px"
        height="100%"
        border="right"
        backgroundColor
        marginRight="2"
      >
        <SettingsNav />
      </Column>
      <Column gap="6" margin="2">
        <PageBody>{children}</PageBody>
      </Column>
    </Grid>
  );
}
