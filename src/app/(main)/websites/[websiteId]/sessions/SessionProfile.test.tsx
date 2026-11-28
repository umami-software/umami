import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SessionProfile } from './SessionProfile';

const mockUseConfig = vi.fn();
const mockUseWebsiteSessionQuery = vi.fn();
const mockUseSessionDataQuery = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useConfig: () => mockUseConfig(),
    useFormat: () => ({
      formatValue: (value: string, type: string) => {
        if (type === 'country' && value === 'CN') return 'China';
        if (type === 'browser' && value === 'chrome') return 'Chrome';
        if (type === 'os' && value === 'Windows 10') return 'Windows 10';
        return value;
      },
    }),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        activity: 'Activity',
        properties: 'Properties',
        replays: 'Replays',
        copy: 'Copy',
        close: 'Close',
      },
    }),
    useMobile: () => ({ isMobile: false }),
    useSessionDataQuery: () => mockUseSessionDataQuery(),
    useWebsiteSessionQuery: () => mockUseWebsiteSessionQuery(),
  };
});

vi.mock('@/components/common/Avatar', () => ({
  Avatar: () => <div>Avatar</div>,
}));

vi.mock('@/components/common/LoadingPanel', () => ({
  LoadingPanel: ({ children, data }: { children: React.ReactNode; data: unknown }) =>
    data ? <div>{children}</div> : null,
}));

vi.mock('./SessionActivity', () => ({
  SessionActivity: () => <div>SessionActivity</div>,
}));

vi.mock('./SessionDeleteButton', () => ({
  SessionDeleteButton: () => <div data-test="session-delete-button" />,
}));

vi.mock('./SessionData', () => ({
  SessionData: () => <div>SessionData</div>,
}));

vi.mock('./SessionInfo', () => ({
  SessionInfo: () => <div>SessionInfo</div>,
}));

vi.mock('./SessionReplaysDataTable', () => ({
  SessionReplaysDataTable: () => <div>SessionReplaysDataTable</div>,
}));

vi.mock('./SessionStats', () => ({
  SessionStats: () => <div>SessionStats</div>,
}));

function createSessionQueryResult(canDelete: boolean, overrides: Record<string, unknown> = {}) {
  return {
    data: {
      id: 'session-1',
      canDelete,
      firstAt: new Date('2026-07-24T00:00:00.000Z'),
      lastAt: new Date('2026-07-24T00:05:00.000Z'),
      distinctId: 'distinct-1',
      views: 3,
      events: 2,
      city: 'Hangzhou',
      country: 'CN',
      browser: 'chrome',
      os: 'Windows 10',
      ...overrides,
    },
    isLoading: false,
    error: undefined,
  };
}

test('hides the delete button on share routes', () => {
  mockUseConfig.mockReturnValue({ sessionDeletionEnabled: true });
  mockUseWebsiteSessionQuery.mockReturnValue(createSessionQueryResult(true));
  mockUseSessionDataQuery.mockReturnValue({ data: [] });

  render(<SessionProfile websiteId="website-1" sessionId="session-1" onClose={() => null} />, {
    route: '/share/slug/sessions?session=session-1',
  });

  expect(screen.queryByTestId('session-delete-button')).not.toBeInTheDocument();
});

test('shows the delete button on regular website routes when deletion is allowed', () => {
  mockUseConfig.mockReturnValue({ sessionDeletionEnabled: true });
  mockUseWebsiteSessionQuery.mockReturnValue(createSessionQueryResult(true));
  mockUseSessionDataQuery.mockReturnValue({ data: [] });

  render(<SessionProfile websiteId="website-1" sessionId="session-1" onClose={() => null} />, {
    route: '/websites/website-1/sessions?session=session-1',
  });

  expect(screen.getByTestId('session-delete-button')).toBeInTheDocument();
});

test('promotes distinctId as header title, renders summary subtitle, and shows tab counts', () => {
  mockUseConfig.mockReturnValue({ sessionDeletionEnabled: false });
  mockUseWebsiteSessionQuery.mockReturnValue(createSessionQueryResult(false));
  mockUseSessionDataQuery.mockReturnValue({ data: [{ dataKey: 'plan' }, { dataKey: 'role' }] });

  render(<SessionProfile websiteId="website-1" sessionId="session-1" />, {
    route: '/websites/website-1/sessions/session-1',
  });

  expect(screen.getByText('distinct-1')).toBeInTheDocument();
  expect(screen.getByText('session-1')).toBeInTheDocument();
  expect(screen.getByText('Hangzhou, China · Chrome · Windows 10')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
});
