'use client';
import { Grid, Loading, Column } from '@umami/react-zen';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { UpdateNotice } from './UpdateNotice';
import { Nav } from '@/app/(main)/Nav';
import { NavBar } from '@/app/(main)/NavBar';
import { Page } from '@/components/layout/Page';
import { useLogin, useConfig } from '@/components/hooks';

export function App({ children }) {
  const { user, isLoading, error } = useLogin();
  const config = useConfig();
  const pathname = usePathname();

  if (isLoading) {
    return <Loading position="page" />;
  }

  if (error) {
    window.location.href = `${process.env.basePath || ''}/login`;
  }

  if (!user || !config) {
    return null;
  }

  if (config.uiDisabled) {
    return null;
  }

  return (
    <Grid
      height="100vh"
      width="100%"
      columns="auto 1fr"
      rows="auto 1fr"
      overflow="hidden"
      backgroundColor="2"
    >
      <Nav gridColumn="1 / 2" gridRow="1 / 3" />
      <NavBar gridColumn="2 / 3" gridRow="1 / 2" />
      <Column alignItems="center" overflow="scroll">
        <Page>
          <UpdateNotice user={user} config={config} />
          {children}
          {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
            <Script src={`${process.env.basePath || ''}/telemetry.js`} />
          )}
        </Page>
      </Column>
    </Grid>
  );
}
