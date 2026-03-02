'use client';
import { Column, Grid, Loading, Row } from '@umami/react-zen';
import Script from 'next/script';
import { useEffect } from 'react';
import { MobileNav } from '@/app/(main)/MobileNav';
import { SideNav } from '@/app/(main)/SideNav';
import { TopNav } from '@/app/(main)/TopNav';
import { useConfig, useLoginQuery, useNavigation } from '@/components/hooks';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem, setItem } from '@/lib/storage';
import { UpdateNotice } from './UpdateNotice';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const config = useConfig();
  const { pathname, teamId } = useNavigation();

  useEffect(() => {
    if (teamId) {
      setItem(LAST_TEAM_CONFIG, teamId);
    } else {
      removeItem(LAST_TEAM_CONFIG);
    }
  }, [teamId]);

  if (isLoading || !config) {
    return <Loading placement="absolute" />;
  }

  if (error) {
    window.location.href = config.cloudMode
      ? `${process.env.cloudUrl}/login`
      : `${process.env.basePath || ''}/login`;
    return null;
  }

  if (!user || !config) {
    return null;
  }

  return (
    <Grid
      columns={{ base: '1fr', lg: 'auto 1fr' }}
      rows={{ base: 'auto 1fr', lg: '1fr' }}
      height="screen"
    >
      <Row display={{ base: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
        <MobileNav />
      </Row>
      <Column display={{ base: 'none', lg: 'flex' }} minHeight="0" style={{ overflow: 'hidden' }}>
        <SideNav />
      </Column>
      <Column overflowX="hidden" minHeight="0" position="relative">
        <TopNav />
        <Column alignItems="center">{children}</Column>
      </Column>
      <UpdateNotice user={user} config={config} />
      {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
        <Script src={`${process.env.basePath || ''}/telemetry.js`} />
      )}
    </Grid>
  );
}
