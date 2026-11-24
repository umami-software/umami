import { SidebarProvider } from '@umami/react-zen';
import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { SideNav } from './SideNav';

const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/hooks')>();
  return {
    ...actual,
    useConfig: () => ({ cloudMode: false }),
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
    <SidebarProvider>
      <SideNav />
    </SidebarProvider>,
    { route },
  );
}

beforeEach(() => {
  navigateTo('/websites');
});

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

test('shows settings links with a way back', () => {
  navigateTo('/settings/profile');

  renderSideNav('/settings/profile');

  expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/websites');
  expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('data-active');
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
