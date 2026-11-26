'use client';
import { Column, Grid, Row, useTheme } from '@umami/react-zen';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BoardViewPage } from '@/app/(main)/boards/[boardId]/BoardViewPage';
import { LinkPage } from '@/app/(main)/links/[linkId]/LinkPage';
import { LinkMetricsPage } from '@/app/(main)/links/[linkId]/metrics/LinkMetricsPage';
import { PixelMetricsPage } from '@/app/(main)/pixels/[pixelId]/metrics/PixelMetricsPage';
import { PixelPage } from '@/app/(main)/pixels/[pixelId]/PixelPage';
import { AttributionPage } from '@/app/(main)/websites/[websiteId]/(reports)/attribution/AttributionPage';
import { BreakdownPage } from '@/app/(main)/websites/[websiteId]/(reports)/breakdown/BreakdownPage';
import { FunnelsPage } from '@/app/(main)/websites/[websiteId]/(reports)/funnels/FunnelsPage';
import { GoalsPage } from '@/app/(main)/websites/[websiteId]/(reports)/goals/GoalsPage';
import { JourneysPage } from '@/app/(main)/websites/[websiteId]/(reports)/journeys/JourneysPage';
import { PerformancePage } from '@/app/(main)/websites/[websiteId]/(reports)/performance/PerformancePage';
import { RetentionPage } from '@/app/(main)/websites/[websiteId]/(reports)/retention/RetentionPage';
import { RevenuePage } from '@/app/(main)/websites/[websiteId]/(reports)/revenue/RevenuePage';
import { UTMPage } from '@/app/(main)/websites/[websiteId]/(reports)/utm/UTMPage';
import { ComparePage } from '@/app/(main)/websites/[websiteId]/compare/ComparePage';
import { EventsActivityPage } from '@/app/(main)/websites/[websiteId]/events/activity/EventsActivityPage';
import { EventsPage } from '@/app/(main)/websites/[websiteId]/events/EventsPage';
import { EventsPropertiesPage } from '@/app/(main)/websites/[websiteId]/events/properties/EventsPropertiesPage';
import { WebsiteMetricsPage } from '@/app/(main)/websites/[websiteId]/metrics/WebsiteMetricsPage';
import { RealtimePage } from '@/app/(main)/websites/[websiteId]/realtime/RealtimePage';
import { SessionsPage } from '@/app/(main)/websites/[websiteId]/sessions/SessionsPage';
import { WebsiteHeader } from '@/app/(main)/websites/[websiteId]/WebsiteHeader';
import { WebsitePage } from '@/app/(main)/websites/[websiteId]/WebsitePage';
import { WebsiteProvider } from '@/app/(main)/websites/WebsiteProvider';
import { PageBody } from '@/components/common/PageBody';
import { useShare } from '@/components/hooks';
import { MobileMenuButton } from '@/components/input/MobileMenuButton';
import { ENTITY_TYPE } from '@/lib/constants';
import { getShareTheme } from '@/lib/share';
import { ShareFooter } from './ShareFooter';
import { ShareNav } from './ShareNav';

const PAGE_COMPONENTS: Record<string, React.ComponentType<{ websiteId: string }>> = {
  '': WebsitePage,
  overview: WebsitePage,
  metrics: WebsiteMetricsPage,
  events: EventsPage,
  'events/activity': EventsActivityPage,
  'events/properties': EventsPropertiesPage,
  sessions: SessionsPage,
  realtime: RealtimePage,
  performance: PerformancePage,
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
  const segments = pathname.split('/').slice(3).filter(Boolean);

  // If first segment looks like a domain name, skip it
  if (segments[0]?.includes('.')) {
    segments.shift();
  }

  return segments.join('/');
}

export function SharePage() {
  const [navCollapsed, setNavCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('share:navCollapsed') === 'true',
  );

  const handleCollapse = (value: boolean) => {
    localStorage.setItem('share:navCollapsed', String(value));
    setNavCollapsed(value);
  };
  const share = useShare();
  const { initTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const path = getSharePath(pathname);
  const { slug, websiteId, boardId, pixelId, linkId, parameters = {}, shareType } = share;
  const shareTheme = getShareTheme(parameters);

  useEffect(() => {
    initTheme(shareTheme, 'system');

    return () => {
      initTheme(undefined, 'system');
    };
  }, [shareTheme, initTheme]);

  // Check if the requested path is allowed. The metrics page is the overview's full lists, so it
  // is allowed whenever the overview is.
  const pageKey = path || '';
  const isMetrics = pageKey === 'metrics';
  const isAllowed =
    pageKey === '' ||
    isMetrics ||
    // Sub-pages (e.g. events/activity) are allowed whenever their parent page is.
    (Object.hasOwn(PAGE_COMPONENTS, pageKey) && parameters[pageKey.split('/')[0]] === true);

  // A link or pixel's metrics page is laid out like a website page, with the metrics in the nav.
  const entityMetricsPage = !isMetrics ? null : shareType === ENTITY_TYPE.pixel && pixelId ? (
    <PixelMetricsPage pixelId={pixelId} showHeaderActions={false} />
  ) : shareType === ENTITY_TYPE.link && linkId ? (
    <LinkMetricsPage linkId={linkId} showHeaderActions={false} />
  ) : null;

  const entityPage = entityMetricsPage ? null : shareType === ENTITY_TYPE.board && boardId ? (
    <BoardViewPage boardId={boardId} showActions={false} />
  ) : shareType === ENTITY_TYPE.pixel && pixelId ? (
    <PixelPage pixelId={pixelId} showHeaderActions={false} />
  ) : shareType === ENTITY_TYPE.link && linkId ? (
    <LinkPage linkId={linkId} showHeaderActions={false} />
  ) : null;

  useEffect(() => {
    if (!isAllowed) {
      router.replace(`/share/${slug}`);
    }
  }, [isAllowed, slug, router]);

  if (entityPage) {
    return (
      <Column>
        {entityPage}
        <ShareFooter />
      </Column>
    );
  }

  if (!isAllowed) {
    return null;
  }

  const PageComponent = PAGE_COMPONENTS[pageKey] || WebsitePage;

  return (
    <Grid columns={{ base: '1fr', lg: `${navCollapsed ? '60px' : '240px'} 1fr` }} width="100%">
      <Row display={{ base: 'flex', lg: 'none' }} alignItems="center" gap padding="3">
        <MobileMenuButton>
          {({ close }) => {
            return <ShareNav onItemClick={close} />;
          }}
        </MobileMenuButton>
      </Row>
      <Column display={{ base: 'none', lg: 'flex' }} marginRight="2">
        <ShareNav collapsed={navCollapsed} onCollapse={handleCollapse} />
      </Column>
      {entityMetricsPage ?? (
        <PageBody gap>
          <WebsiteProvider websiteId={websiteId}>
            <Column>
              <WebsiteHeader showActions={false} allowLink={false} />
              <PageComponent websiteId={websiteId} />
            </Column>
          </WebsiteProvider>
        </PageBody>
      )}
    </Grid>
  );
}
