'use client';
import { Grid, Loading, Column } from '@umami/react-zen';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { UpdateNotice } from './UpdateNotice';
import { SideNav } from '@/app/(main)/SideNav';
import { MenuBar } from '@/app/(main)/MenuBar';
import { Page } from '@/components/common/Page';
import { useLoginQuery, useConfig } from '@/components/hooks';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const config = useConfig();
  const pathname = usePathname();

  if (isLoading) {
    return <Loading position="page" />;
  }

  if (error) {
    window.location.href = `${process.env.basePath || ''}/login`;
    return null;
  }

  if (!user || !config) {
    return null;
  }

  if (config.uiDisabled) {
    return null;
  }

  return (
    <Grid height="100vh" width="100%" columns="auto 1fr" rows="auto 1fr">
      <SideNav gridColumn="1 / 2" gridRow="1 / 3" />
      <MenuBar gridColumn="2 / 3" gridRow="1 / 2" />
      <Column
        gridColumn="2 / 3"
        gridRow="2 / 3"
        alignItems="center"
        overflow="auto"
        backgroundColor="2"
        position="relative"
      >
        <Page>
          {children}
          {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
            <Script src={`${process.env.basePath || ''}/telemetry.js`} />
          )}
        </Page>
      </Column>
      <UpdateNotice user={user} config={config} />
    </Grid>
  );
}
