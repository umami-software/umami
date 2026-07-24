import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SessionProfile } from './SessionProfile';

const mockUseConfig = vi.fn();
const mockUseWebsiteSessionQuery = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useConfig: () => mockUseConfig(),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        activity: 'Activity',
        properties: 'Properties',
        replays: 'Replays',
      },
    }),
    useMobile: () => ({ isMobile: false }),
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

function createSessionQueryResult(canDelete: boolean) {
  return {
    data: {
      id: 'session-1',
      canDelete,
      firstAt: new Date('2026-07-24T00:00:00.000Z'),
      lastAt: new Date('2026-07-24T00:05:00.000Z'),
      distinctId: 'distinct-1',
    },
    isLoading: false,
    error: undefined,
  };
}

test('hides the delete button on share routes', () => {
  mockUseConfig.mockReturnValue({ sessionDeletionEnabled: true });
  mockUseWebsiteSessionQuery.mockReturnValue(createSessionQueryResult(true));

  render(<SessionProfile websiteId="website-1" sessionId="session-1" onClose={() => null} />, {
    route: '/share/slug/sessions?session=session-1',
  });

  expect(screen.queryByTestId('session-delete-button')).not.toBeInTheDocument();
});

test('shows the delete button on regular website routes when deletion is allowed', () => {
  mockUseConfig.mockReturnValue({ sessionDeletionEnabled: true });
  mockUseWebsiteSessionQuery.mockReturnValue(createSessionQueryResult(true));

  render(<SessionProfile websiteId="website-1" sessionId="session-1" onClose={() => null} />, {
    route: '/websites/website-1/sessions?session=session-1',
  });

  expect(screen.getByTestId('session-delete-button')).toBeInTheDocument();
});
