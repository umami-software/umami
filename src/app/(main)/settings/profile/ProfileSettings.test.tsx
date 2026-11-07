import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { ProfileSettings } from './ProfileSettings';

const mockUseLoginQuery = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useLoginQuery: () => mockUseLoginQuery(),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        username: 'Username',
        role: 'Role',
        admin: 'Administrator',
        user: 'User',
      },
    }),
  };
});

test('renders user profile details without password field', () => {
  mockUseLoginQuery.mockReturnValue({
    user: {
      username: 'admin',
      role: 'admin',
    },
  });

  render(<ProfileSettings />);

  expect(screen.getByText('Username')).toBeInTheDocument();
  expect(screen.getByText('admin')).toBeInTheDocument();
  expect(screen.getByText('Role')).toBeInTheDocument();
  expect(screen.getByText('Administrator')).toBeInTheDocument();
  expect(screen.queryByText('Password')).not.toBeInTheDocument();
});
