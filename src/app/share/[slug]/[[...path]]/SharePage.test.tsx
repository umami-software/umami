import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@/test/render';
import { resetTestNavigation } from '@/test/navigation';
import { setShareData } from '@/store/app';
import { ShareProvider } from '@/app/share/ShareProvider';
import { SharePage } from './SharePage';

const mockShare = vi.hoisted(() => ({
  slug: 'slug',
  shareId: 'share-1',
  shareType: 1,
  websiteId: 'website-1',
  token: 'share-token',
  parameters: {
    events: true,
  },
}));

const initTheme = vi.fn();

vi.mock('@umami/react-zen', async importOriginal => {
  const actual = await importOriginal<typeof import('@umami/react-zen')>();

  return {
    ...actual,
    useTheme: () => ({
      initTheme,
    }),
  };
});

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();

  return {
    ...actual,
    useShareTokenQuery: () => ({
      share: mockShare,
      data: mockShare,
      isLoading: false,
      isFetching: false,
    }),
  };
});

vi.mock('@/app/(main)/boards/[boardId]/BoardViewPage', () => ({
  BoardViewPage: () => <div>board view page</div>,
}));

vi.mock('@/app/(main)/links/[linkId]/LinkPage', () => ({
  LinkPage: () => <div>link page</div>,
}));

vi.mock('@/app/(main)/pixels/[pixelId]/PixelPage', () => ({
  PixelPage: () => <div>pixel page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/attribution/AttributionPage', () => ({
  AttributionPage: () => <div>attribution page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/breakdown/BreakdownPage', () => ({
  BreakdownPage: () => <div>breakdown page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/funnels/FunnelsPage', () => ({
  FunnelsPage: () => <div>funnels page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/goals/GoalsPage', () => ({
  GoalsPage: () => <div>goals page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/journeys/JourneysPage', () => ({
  JourneysPage: () => <div>journeys page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/performance/PerformancePage', () => ({
  PerformancePage: () => <div>performance page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/retention/RetentionPage', () => ({
  RetentionPage: () => <div>retention page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/revenue/RevenuePage', () => ({
  RevenuePage: () => <div>revenue page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/(reports)/utm/UTMPage', () => ({
  UTMPage: () => <div>utm page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/compare/ComparePage', () => ({
  ComparePage: () => <div>compare page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/events/EventsPage', () => ({
  EventsPage: () => <div>events page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/realtime/RealtimePage', () => ({
  RealtimePage: () => <div>realtime page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/sessions/SessionsPage', () => ({
  SessionsPage: () => <div>sessions page</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/WebsiteHeader', () => ({
  WebsiteHeader: () => <div>website header</div>,
}));

vi.mock('@/app/(main)/websites/[websiteId]/WebsitePage', () => ({
  WebsitePage: () => <div>website page</div>,
}));

vi.mock('@/app/(main)/websites/WebsiteProvider', () => ({
  WebsiteProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/common/PageBody', () => ({
  PageBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/input/MobileMenuButton', () => ({
  MobileMenuButton: ({ children }: { children: ReactNode | ((props: { close: () => void }) => ReactNode) }) => (
    <div>{typeof children === 'function' ? children({ close: () => {} }) : children}</div>
  ),
}));

vi.mock('./ShareFooter', () => ({
  ShareFooter: () => <div>share footer</div>,
}));

vi.mock('./ShareNav', () => ({
  ShareNav: () => <div>share nav</div>,
}));

describe('SharePage', () => {
  beforeEach(() => {
    resetTestNavigation();
    initTheme.mockReset();
    setShareData(mockShare, { token: mockShare.token });
  });

  test('renders an allowed website share route', () => {
    render(
      <ShareProvider slug="slug">
        <SharePage />
      </ShareProvider>,
      { route: '/share/slug/events' },
    );

    expect(screen.getAllByText('share nav')).toHaveLength(2);
    expect(screen.getByText('website header')).toBeInTheDocument();
    expect(screen.getByText('events page')).toBeInTheDocument();
    expect(initTheme).toHaveBeenCalled();
  });
});
