'use client';
import { Column, Grid, Icon, Row, Text, useTheme } from '@umami/react-zen';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
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
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { Logo } from '@/components/svg';
import { ShareFooter } from './ShareFooter';
import { ShareHeader } from './ShareHeader';
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

// All section IDs that can be enabled/disabled via parameters
const ALL_SECTION_IDS = [
  'overview',
  'events',
  'sessions',
  'realtime',
  'compare',
  'breakdown',
  'goals',
  'funnels',
  'journeys',
  'retention',
  'utm',
  'revenue',
  'attribution',
];

export function SharePage({ shareId, path = '' }: { shareId: string; path?: string }) {
  const { shareToken, isLoading } = useShareTokenQuery(shareId);
  const { setTheme } = useTheme();
  const router = useRouter();

  // Calculate allowed sections
  const allowedSections = useMemo(() => {
    if (!shareToken?.parameters) return [];
    const params = shareToken.parameters;
    return ALL_SECTION_IDS.filter(id => params[id] !== false);
  }, [shareToken?.parameters]);

  useEffect(() => {
    const url = new URL(window?.location?.href);
    const theme = url.searchParams.get('theme');

    if (theme === 'light' || theme === 'dark') {
      setTheme(theme);
    }
  }, []);

  // Redirect to the only allowed section if there's just one and we're on the base path
  useEffect(() => {
    if (
      allowedSections.length === 1 &&
      allowedSections[0] !== 'overview' &&
      (path === '' || path === 'overview')
    ) {
      router.replace(`/share/${shareId}/${allowedSections[0]}`);
    }
  }, [allowedSections, shareId, path, router]);

  if (isLoading || !shareToken) {
    return null;
  }

  const { websiteId, parameters = {}, whiteLabel } = shareToken;
  const logoName = whiteLabel?.name || 'umami';
  const logoImage = whiteLabel?.image;

  // Redirect to only allowed section - return null while redirecting
  if (
    allowedSections.length === 1 &&
    allowedSections[0] !== 'overview' &&
    (path === '' || path === 'overview')
  ) {
    return null;
  }

  // Check if the requested path is allowed
  const pageKey = path || '';
  const isAllowed = pageKey === '' || pageKey === 'overview' || parameters[pageKey] !== false;

  if (!isAllowed) {
    return null;
  }

  const PageComponent = PAGE_COMPONENTS[pageKey] || WebsitePage;

  return (
    <Column backgroundColor="2">
      <Grid columns={{ xs: '1fr', lg: 'auto 1fr' }} width="100%" height="100%">
        <Row display={{ xs: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
          <Grid columns="auto 1fr" flexGrow={1} backgroundColor="3" borderRadius>
            <MobileMenuButton>
              {({ close }) => {
                return <ShareNav shareId={shareId} parameters={parameters} onItemClick={close} />;
              }}
            </MobileMenuButton>
            <Row alignItems="center" justifyContent="center" gap>
              {whiteLabel?.image ? (
                <img src={logoImage} alt={logoName} style={{ height: 24 }} />
              ) : (
                <Icon>
                  <Logo />
                </Icon>
              )}
              <Text weight="bold">{logoName}</Text>
            </Row>
          </Grid>
        </Row>
        <Column
          display={{ xs: 'none', lg: 'flex' }}
          width="240px"
          height="100%"
          border="right"
          backgroundColor
          marginRight="2"
        >
          <Column display={{ xs: 'none', lg: 'flex' }}>
            <ShareNav shareId={shareId} parameters={parameters} />
          </Column>
        </Column>
        <PageBody gap>
          <WebsiteProvider websiteId={websiteId}>
            <ShareHeader whiteLabel={whiteLabel} />
            <Column>
              <WebsiteHeader showActions={false} />
              <PageComponent websiteId={websiteId} />
            </Column>
            <ShareFooter whiteLabel={whiteLabel} />
          </WebsiteProvider>
        </PageBody>
      </Grid>
    </Column>
  );
}
