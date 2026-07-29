'use client';
import { Column, Grid, Loading, Row } from '@umami/react-zen';
import Script from 'next/script';
import { useEffect } from 'react';
import { MobileNav } from '@/app/(main)/MobileNav';
import { SideNav } from '@/app/(main)/SideNav';
import { TopNav } from '@/app/(main)/TopNav';
import {
  useConfig,
  useLoginQuery,
  useNavigation,
  useTeamQuery,
  useTwoFactorStatusQuery,
} from '@/components/hooks';
import { TwoFactorSetupModal } from '@/components/modals/TwoFactorSetupModal';
import { LAST_TEAM_CONFIG } from '@/lib/constants';
import { removeItem, setItem } from '@/lib/storage';
import { UpdateNotice } from './UpdateNotice';

export function App({ children }) {
  const { user, isLoading, error } = useLoginQuery();
  const config = useConfig();
  const { pathname, router, teamId } = useNavigation();
  const { isLoading: isTeamLoading, error: teamError } = useTeamQuery(teamId);
  const { data: twoFactorStatus } = useTwoFactorStatusQuery(!!user);
  const needsTwoFactorSetup = !!(twoFactorStatus?.isRequired && !twoFactorStatus?.isEnabled);

  useEffect(() => {
    if (teamId) {
      setItem(LAST_TEAM_CONFIG, teamId);
    } else {
      removeItem(LAST_TEAM_CONFIG);
    }
  }, [teamId]);

  useEffect(() => {
    if (teamId && teamError) {
      removeItem(LAST_TEAM_CONFIG);
      router.replace('/');
    }
  }, [teamId, teamError, router]);

  if (isLoading || !config || (teamId && isTeamLoading)) {
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

  if (teamId && teamError) {
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
        <Column
          alignItems="center"
          aria-hidden={needsTwoFactorSetup || undefined}
          style={needsTwoFactorSetup ? { pointerEvents: 'none' } : undefined}
        >
          {children}
        </Column>
      </Column>
      {needsTwoFactorSetup && <TwoFactorSetupModal required={true} />}
      <UpdateNotice user={user} config={config} />
      {process.env.NODE_ENV === 'production' && !pathname.includes('/share/') && (
        <Script src={`${process.env.basePath || ''}/telemetry.js`} />
      )}
      {process.env.selfTrack && (
        <Script
          async
          data-website-id={process.env.selfTrack}
          src={`${process.env.basePath || ''}/script.js`}
          data-cache="true"
          data-performance="true"
        />
      )}
      {process.env.selfRecord && (
        <Script
          async
          data-website-id={process.env.selfRecord}
          data-sample-rate="1"
          src={`${process.env.basePath || ''}/recorder.js`}
        />
      )}
    </Grid>
  );
}
