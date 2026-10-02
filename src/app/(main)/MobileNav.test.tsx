import { beforeEach, expect, test, vi } from 'vitest';
import type { useNavigation } from '@/components/hooks';
import { render, screen } from '@/test/render';
import { MobileNav } from './MobileNav';

const mockUseNavigation = vi.fn();

vi.mock('@/components/hooks', async importOriginal => {
  const actual = await importOriginal<typeof useNavigation>();
  return { ...actual, useNavigation: () => mockUseNavigation() };
});

vi.mock('@/components/input/MobileMenuButton', () => ({
  MobileMenuButton: ({ children }: { children: (props: { close: () => void }) => unknown }) => (
    <div>{children({ close: () => null })}</div>
  ),
}));

vi.mock('@/components/input/UserButton', () => ({
  UserButton: () => null,
}));

beforeEach(() => {
  mockUseNavigation.mockReturnValue({
    pathname: '/',
    websiteId: undefined,
    teamId: undefined,
    renderUrl: (path: string) => path,
  });
});

test('shows the dashboard link outside a team', () => {
  render(<MobileNav />);

  expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
});

test('hides the dashboard link inside a team', () => {
  mockUseNavigation.mockReturnValue({
    pathname: '/teams/team-1',
    websiteId: undefined,
    teamId: 'team-1',
    renderUrl: (path: string) => path,
  });

  render(<MobileNav />);

  expect(screen.queryByRole('link', { name: /dashboard/i })).not.toBeInTheDocument();
});
