'use client';
import { Column, Grid, useTheme } from '@umami/react-zen';
import { useEffect } from 'react';
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
import { useShareTokenQuery } from '@/components/hooks';
import { Footer } from './Footer';
import { Header } from './Header';
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

export function SharePage({ shareId, path = '' }: { shareId: string; path?: string }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);
  const { setTheme } = useTheme();

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const theme = url.searchParams.get('theme');

    if (theme === 'light' || theme === 'dark') {
      setTheme(theme);
    }
  }, []);

  if (isLoading || !shareToken) {
    return null;
  }

  const { websiteId, parameters = {}, whiteLabel } = shareToken;

  // Check if the requested path is allowed
  const pageKey = path || '';
  const isAllowed = pageKey === '' || pageKey === 'overview' || parameters[pageKey] !== false;

  if (!isAllowed) {
    return null;
  }

  const PageComponent = PAGE_COMPONENTS[pageKey] || WebsitePage;

  return (
    <Column backgroundColor="2">
      <Header />
      <Grid columns={{ xs: '1fr', lg: 'auto 1fr' }} width="100%" height="100%">
        <Column
          display={{ xs: 'none', lg: 'flex' }}
          width="240px"
          height="100%"
          border="right"
          backgroundColor
          marginRight="2"
        >
          <ShareNav shareId={shareId} parameters={parameters} />
        </Column>
        <PageBody gap>
          <WebsiteProvider websiteId={websiteId}>
            <Header whiteLabel={whiteLabel} />
            <Column>
              <PageComponent websiteId={websiteId} />
            </Column>
            <Footer whiteLabel={whiteLabel} />
          </WebsiteProvider>
        </PageBody>
      </Grid>
      <Footer />
    </Column>
  );
}
