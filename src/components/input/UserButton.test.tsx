import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { UserButton } from './UserButton';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/hooks', () => ({
  useConfig: () => ({ cloudMode: false }),
  useLocale: () => ({ locale: 'en-US', saveLocale: vi.fn() }),
  useLoginQuery: () => ({ user: { username: 'admin', isAdmin: false } }),
  useMessages: () => ({
    t: (value: string) => value,
    labels: {
      admin: 'Admin',
      documentation: 'Documentation',
      language: 'Language',
      logout: 'Logout',
      settings: 'Settings',
      support: 'Support',
      theme: 'Theme',
    },
  }),
  useMobile: () => ({ isMobile: false }),
}));

test('renders the expanded sidebar control at full width and opens its menu', async () => {
  const { user } = render(<UserButton />);
  const button = screen.getByRole('button', { name: 'admin' });

  expect(button).toHaveStyle({ width: '100%' });

  await user.click(button);

  expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
});

test('keeps the collapsed sidebar control accessible and interactive', async () => {
  const { user } = render(<UserButton showText={false} />);
  const button = screen.getByRole('button', { name: 'admin' });

  await user.click(button);

  expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
});
