import { SidebarProvider } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { ConfigContext } from '@/components/hooks/useConfig';
import { getConfig } from '@/lib/config';
import { render, screen } from '@/test/render';
import { MobileNav } from './MobileNav';

const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();
  return {
    ...actual,
    useNavigation: () => mockUseNavigation(),
  };
});

vi.mock('@/components/input/MobileMenuButton', () => ({
  MobileMenuButton: ({ children }: { children: (props: { close: () => void }) => ReactNode }) => (
    <div>{children({ close: () => null })}</div>
  ),
}));

vi.mock('@/components/input/UserButton', () => ({
  UserButton: () => null,
}));

// MobileNav renders SidebarMenuButtons, which need a SidebarProvider (App provides it).
function renderMobileNav(route?: string) {
  return render(
    <ConfigContext.Provider value={getConfig()}>
      <SidebarProvider>
        <MobileNav />
      </SidebarProvider>
    </ConfigContext.Provider>,
    { route },
  );
}

beforeEach(() => {
  vi.stubEnv('CLOUD_MODE', undefined);
  vi.stubEnv('ENABLE_SETTINGS', undefined);
  mockUseNavigation.mockReturnValue({
    pathname: '/',
    websiteId: undefined,
    teamId: undefined,
    renderUrl: (path: string) => path,
  });
});

afterEach(() => vi.unstubAllEnvs());

test('shows the dashboard link outside a team', () => {
  renderMobileNav();

  expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
});

test('hides the dashboard link inside a team', () => {
  mockUseNavigation.mockReturnValue({
    pathname: '/teams/team-1',
    websiteId: undefined,
    teamId: 'team-1',
    renderUrl: (path: string) => path,
  });

  renderMobileNav();

  expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
});

test('shows a settings link above the user button', () => {
  renderMobileNav();

  expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute('href', '/settings');
});

test('hides the Settings shortcut on a Settings page', () => {
  mockUseNavigation.mockReturnValue({ ...mockUseNavigation(), pathname: '/settings/profile' });

  renderMobileNav('/settings/profile');

  expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /^settings$/i })).not.toBeInTheDocument();
});

test.each([
  [undefined, 'https://cloud.example.com/settings'],
  ['1', '/settings'],
])('uses the configured Settings link in Cloud mode with ENABLE_SETTINGS=%s', (value, href) => {
  vi.stubEnv('CLOUD_MODE', '1');
  vi.stubEnv('ENABLE_SETTINGS', value);
  vi.stubEnv('cloudUrl', 'https://cloud.example.com');

  renderMobileNav();

  expect(screen.getByRole('link', { name: /^settings$/i })).toHaveAttribute('href', href);
});
