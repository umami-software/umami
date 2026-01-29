'use client';
import { Column, Grid, Row, useTheme } from '@umami/react-zen';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AttributionPage } from '@/app/(main)/websites/[websiteId]/(reports)/attribution/AttributionPage';
import { BreakdownPage } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/BreakdownPage';
import { FunnelsPage } from '@/app/(main)/websites/[websiteId]/(reports)/funnels/FunnelsPage';
import { GoalsPage } from '@/app/(main)/websites/[websiteId]/(reports)/goals/GoalsPage';
import { JourneysPage } from '@/app/(main)/websites/[websiteId]/(reports)/journeys/JourneysPage';
import { RetentionPage } from '@/app/(main)/websites/[websiteId]/(reports)/retention/RetentionPage';
import { RevenuePage } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/RevenuePage';
import { UTMPage } from '@/app/(main)/websites/[websiteId]/(reports)/utm/UTMPage';
import { ComparePage } from '@/app/(main)/websites/[websiteId]/compare/ComparePage';
import { EventsPage } from '@/app/(main)/websites/[websiteId]/events/EventsPage';
import { RealtimePage } from '@/app/(main)/websites/[websiteId]/realtime/RealtimePage';
import { SessionsPage } from '@/app/(main)/websites/[websiteId]/sessions/SessionsPage';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { useShare } from '@/components/hooks';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { ShareNav } from './ShareNav';

const PAGE_COMPONENTS: Record<string, React.ComponentType<{ websiteId: string }>> = {
  '': WebsitePage,
  overview: WebsitePage,
  events: EventsPage,
  sessions: SessionsPage,
  realtime: RealtimePage,
  compare: ComparePage,
  breakdown: BreakdownPage,
  goals: GoalsPage,
  funnels: FunnelsPage,
  journeys: JourneysPage,
  retention: RetentionPage,
  utm: UTMPage,
  revenue: RevenuePage,
  attribution: AttributionPage,
};

function getSharePath(pathname: string) {
  const segments = pathname.split('/');
  const firstSegment = segments[3];

  // If first segment looks like a domain name, skip it
  if (firstSegment?.includes('.')) {
    return segments[4];
  }

  return firstSegment;
}

export function SharePage() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const share = useShare();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const path = getSharePath(pathname);
  const { websiteId, parameters = {} } = share;

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const theme = url.searchParams.get('theme');

    if (theme === 'light' || theme === 'dark') {
      setTheme(theme);
    }
  }, []);

  // Check if the requested path is allowed
  const pageKey = path || '';
  const isAllowed = pageKey === '' || pageKey === 'overview' || parameters[pageKey] !== false;

  if (!isAllowed) {
    return null;
  }

  const PageComponent = PAGE_COMPONENTS[pageKey] || WebsitePage;

  return (
    <Grid columns={{ xs: '1fr', lg: `${navCollapsed ? '60px' : '240px'} 1fr` }} width="100%">
      <Row display={{ xs: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
        <MobileMenuButton>
          {({ close }) => {
            return <ShareNav onItemClick={close} />;
          }}
        </MobileMenuButton>
      </Row>
      <Column display={{ xs: 'none', lg: 'flex' }} marginRight="2">
        <ShareNav collapsed={navCollapsed} onCollapse={setNavCollapsed} />
      </Column>
      <PageBody gap>
        <WebsiteProvider websiteId={websiteId}>
          <Column>
            <WebsiteHeader showActions={false} />
            <PageComponent websiteId={websiteId} />
          </Column>
        </WebsiteProvider>
      </PageBody>
    </Grid>
  );
}
