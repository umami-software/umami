'use client';
import { Grid, Loading, Column, Row } from '@umami/react-zen';
import Script from 'next/script';
import { UpdateNotice } from './UpdateNotice';
import { SideNav } from '@/app/(main)/SideNav';
import { useLoginQuery, useConfig, useNavigation } from '@/components/hooks';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const config = useConfig();
  const { pathname, router } = useNavigation();

  if (isLoading || !config) {
    return <Loading placement="absolute" />;
  }

  if (error) {
    if (process.env.cloudMode) {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
    return null;
  }

  if (!user || !config) {
    return null;
  }

  return (
    <Grid columns={{ xs: '1fr', md: 'auto 1fr' }} height="100vh" width="100%" backgroundColor="2">
      <Row display={{ xs: 'flex', md: 'none' }} alignItems="center" gap>
        oh hi
      </Row>
      <Column display={{ xs: 'none', md: 'flex' }}>
        <SideNav />
      </Column>
      <Column alignItems="center" overflowY="auto" overflowX="hidden" position="relative">
        {children}
      </Column>
      <UpdateNotice user={user} config={config} />
      {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
        <Script src={`${process.env.basePath || ''}/telemetry.js`} />
      )}
    </Grid>
  );
}
