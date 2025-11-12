'use client';
import { Grid, Loading, Column, Row } from '@umami/react-zen';
import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { UpdateNotice } from './UpdateNotice';
import { SideNav } from '@/app/(main)/SideNav';
import { useLoginQuery, useConfig, useNavigation } from '@/components/hooks';
import { MobileNav } from '@/app/(main)/MobileNav';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const config = useConfig();
  const { pathname, router } = useNavigation();

  // Avoid navigation during render; perform redirect after commit.
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (redirectedRef.current) return;
    if (isLoading) return;
    if (error) {
      redirectedRef.current = true;
      if (process.env.cloudMode) {
        window.location.assign('/login');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, error, router]);

  if (isLoading || !config) {
    return <Loading placement="absolute" />;
  }

  if (error) {
    // Navigation handled in effect to prevent React warning in dev.
    return null;
  }

  if (!user || !config) {
    return null;
  }

  return (
    <Grid
      columns={{ xs: '1fr', lg: 'auto 1fr' }}
      rows={{ xs: 'auto 1fr', lg: '1fr' }}
      height={{ xs: 'auto', lg: '100vh' }}
      width="100%"
    >
      <Row display={{ xs: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
        <MobileNav />
      </Row>
      <Column display={{ xs: 'none', lg: 'flex' }}>
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
