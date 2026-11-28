import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SessionActivity } from './SessionActivity';
import { SessionInfo } from './SessionInfo';
import { SessionStats } from './SessionStats';

const mockUseSessionActivityQuery = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useFormat: () => ({
      formatValue: (value: string, type: string) => {
        if (type === 'country' && value === 'CN') return 'China';
        if (type === 'browser' && value === 'chrome') return 'Chrome';
        if (type === 'os' && value === 'Windows 10') return 'Windows 10';
        if (type === 'device' && value === 'laptop') return 'Laptop';
        if (type === 'language' && value === 'zh-CN') return 'Chinese';
        return value;
      },
    }),
    useLocale: () => ({ locale: 'en-US', dateLocale: undefined }),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        session: 'Session',
        firstSeen: 'First seen',
        lastSeen: 'Last seen',
        referrer: 'Referrer',
        direct: 'Direct',
        distinctId: 'Distinct ID',
        location: 'Location',
        system: 'System',
        os: 'OS',
        browser: 'Browser',
        device: 'Device',
        screen: 'Screen',
        language: 'Language',
        visits: 'Visits',
        views: 'Views',
        events: 'Events',
        event: 'Event',
        visitDuration: 'Visit duration',
        viewedPage: 'Viewed page',
        triggeredEvent: 'Triggered event',
      },
    }),
    useRegionNames: () => ({
      getRegionName: (code?: string) => (code === 'CN-ZJ' ? 'Zhejiang' : code || ''),
    }),
    useSessionActivityQuery: () => mockUseSessionActivityQuery(),
    useTimezone: () => ({
      formatTimezoneDate: (date: string | Date, fmt: string) => {
        const d = new Date(date);
        if (fmt === 'yyyy-MM-dd') return d.toISOString().slice(0, 10);
        if (fmt === 'PPPP') return 'March 28, 2026';
        return d.toISOString().slice(11, 19);
      },
    }),
  };
});

vi.mock('@/components/common/DateDistance', () => ({
  DateDistance: ({ date }: { date: Date }) => <span>rel:{date.toISOString()}</span>,
}));

vi.mock('@/components/common/Favicon', () => ({
  Favicon: ({ domain }: { domain: string }) => <span>fav:{domain}</span>,
}));

vi.mock('@/components/common/TypeIcon', () => ({
  TypeIcon: ({ type, value }: { type: string; value: string }) => (
    <span>
      icon:{type}:{value}
    </span>
  ),
}));

vi.mock('@/components/metrics/EventData', () => ({
  EventData: () => <div>EventData</div>,
}));

test('SessionInfo combines location fields, shows screen and language, and collapses identical timestamps', () => {
  const ts = '2026-03-28T14:10:02.000Z';

  render(
    <SessionInfo
      layout="sidebar"
      data={{
        firstAt: ts,
        lastAt: ts,
        country: 'CN',
        region: 'CN-ZJ',
        city: 'Hangzhou',
        os: 'Windows 10',
        browser: 'chrome',
        device: 'laptop',
        screen: '1280x720',
        language: 'zh-CN',
      }}
    />,
  );

  expect(screen.getByText('Hangzhou, Zhejiang')).toBeInTheDocument();
  expect(screen.getByText('China')).toBeInTheDocument();
  expect(screen.getByText('1280 × 720')).toBeInTheDocument();
  expect(screen.getByText('Chinese (zh-CN)')).toBeInTheDocument();
  expect(screen.getByText('First seen')).toBeInTheDocument();
  expect(screen.queryByText('Last seen')).not.toBeInTheDocument();
  expect(screen.getByText('Direct')).toBeInTheDocument();
});

test('SessionStats formats zero duration as em dash', () => {
  render(<SessionStats data={{ visits: 1, views: 1, events: 0, totaltime: 0 }} />);

  expect(screen.getByText('—')).toBeInTheDocument();
});

test('SessionActivity groups visits, hides single hostname, and renders time deltas', () => {
  mockUseSessionActivityQuery.mockReturnValue({
    data: [
      {
        eventId: 'e2',
        createdAt: '2026-03-28T14:10:16.000Z',
        urlPath: '/docs/install',
        eventName: 'signup_click',
        visitId: 'abcdef123456',
        hostname: 'umami.is',
        hasData: 0,
      },
      {
        eventId: 'e1',
        createdAt: '2026-03-28T14:10:02.000Z',
        urlPath: '/docs/install',
        visitId: 'abcdef123456',
        hostname: 'umami.is',
        hasData: 0,
      },
    ],
    isLoading: false,
    error: undefined,
  });

  render(
    <SessionActivity
      websiteId="w1"
      sessionId="s1"
      startDate={new Date('2026-03-28T14:10:02.000Z')}
      endDate={new Date('2026-03-28T14:10:16.000Z')}
    />,
  );

  expect(screen.getByText('March 28, 2026')).toBeInTheDocument();
  expect(screen.getByText('/docs/install')).toBeInTheDocument();
  expect(screen.getByText('signup_click')).toBeInTheDocument();
  expect(screen.getByText('+14s')).toBeInTheDocument();
  expect(screen.queryByText('umami.is')).not.toBeInTheDocument();
});

test('SessionActivity shows hostnames when a session spans multiple hosts', () => {
  mockUseSessionActivityQuery.mockReturnValue({
    data: [
      {
        eventId: 'e2',
        createdAt: '2026-03-28T14:11:00.000Z',
        urlPath: '/pricing',
        visitId: 'abcdef123456',
        hostname: 'cloud.umami.is',
        hasData: 0,
      },
      {
        eventId: 'e1',
        createdAt: '2026-03-28T14:10:00.000Z',
        urlPath: '/docs/install',
        visitId: 'abcdef123456',
        hostname: 'umami.is',
        hasData: 0,
      },
    ],
    isLoading: false,
    error: undefined,
  });

  render(
    <SessionActivity
      websiteId="w1"
      sessionId="s1"
      startDate={new Date('2026-03-28T14:10:00.000Z')}
      endDate={new Date('2026-03-28T14:11:00.000Z')}
    />,
  );

  expect(screen.getByText('umami.is')).toBeInTheDocument();
  expect(screen.getByText('cloud.umami.is')).toBeInTheDocument();
});
