import { SidebarProvider } from '@umami/react-zen';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ConfigContext } from '@/components/hooks/useConfig';
import { getConfig } from '@/lib/config';
import { render, screen } from '@/test/render';
import { SideNav } from './SideNav';

const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();
  return {
    ...actual,
    useNavigation: () => mockUseNavigation(),
  };
});

vi.mock('@/components/input/UserButton', () => ({
  UserButton: () => null,
}));

function navigateTo(pathname: string, extra: Record<string, unknown> = {}) {
  mockUseNavigation.mockReturnValue({
    pathname,
    websiteId: undefined,
    teamId: undefined,
    renderUrl: (path: string) => path,
    ...extra,
  });
}

function renderSideNav(route?: string) {
  return render(
    <ConfigContext.Provider value={getConfig()}>
      <SidebarProvider>
        <SideNav />
      </SidebarProvider>
    </ConfigContext.Provider>,
    { route },
  );
}

beforeEach(() => {
  vi.stubEnv('CLOUD_MODE', undefined);
  vi.stubEnv('ENABLE_SETTINGS', undefined);
  navigateTo('/websites');
});

afterEach(() => vi.unstubAllEnvs());

test('marks the current section as active', () => {
  renderSideNav();

  expect(screen.getByRole('link', { name: /websites/i })).toHaveAttribute('data-active');
  expect(screen.getByRole('link', { name: /boards/i })).not.toHaveAttribute('data-active');
});

test('hides the dashboard link inside a team', () => {
  navigateTo('/teams/team-1/websites', { teamId: 'team-1' });

  renderSideNav();

  expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
});

test('shows settings navigation with a way back and no footer Settings shortcut', () => {
  navigateTo('/settings/profile');

  renderSideNav('/settings/profile');

  expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/websites');
  expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('data-active');
  expect(screen.queryByRole('link', { name: /^settings$/i })).not.toBeInTheDocument();
});

test('collapses to icons when toggled', async () => {
  const { user } = renderSideNav();

  expect(screen.getByText('umami')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));

  expect(screen.queryByText('umami')).not.toBeInTheDocument();
});

test('shows a settings link in the footer', () => {
  renderSideNav();

  expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute('href', '/settings');
});

test('links to Cloud Settings by default in Cloud mode', () => {
  vi.stubEnv('CLOUD_MODE', '1');
  vi.stubEnv('cloudUrl', 'https://cloud.example.com');

  renderSideNav();

  expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute(
    'href',
    'https://cloud.example.com/settings',
  );
});

test('links to local Settings when enabled in Cloud mode', () => {
  vi.stubEnv('CLOUD_MODE', '1');
  vi.stubEnv('ENABLE_SETTINGS', '1');

  renderSideNav();

  expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute('href', '/settings');
});

test('hides API keys and the Settings shortcut on a local Settings page in Cloud mode', () => {
  vi.stubEnv('CLOUD_MODE', '1');
  vi.stubEnv('ENABLE_SETTINGS', '1');
  navigateTo('/settings/profile');

  renderSideNav('/settings/profile');

  expect(screen.queryByRole('link', { name: /^settings$/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /api keys/i })).not.toBeInTheDocument();
});

test('shows the metrics, with a way back to the overview, on the metrics page', () => {
  const websiteId = '0f9a3c2e-1b4d-4e8a-9c7f-2d6b5a4e3f10';
  const path = `/websites/${websiteId}/metrics`;

  navigateTo(path, { websiteId });

  renderSideNav(`${path}?view=browser&date=24h`);

  // Back keeps the date but drops the metric.
  expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
    'href',
    `/websites/${websiteId}?date=24h`,
  );
  expect(screen.getByRole('link', { name: /browser/i })).toHaveAttribute('data-active');
  expect(screen.queryByRole('link', { name: /overview/i })).not.toBeInTheDocument();
});
