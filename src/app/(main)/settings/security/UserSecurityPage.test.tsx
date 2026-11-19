import { expect, test, vi } from 'vitest';
import { render, screen } from '@/test/render';
import { UserSecurityPage } from './UserSecurityPage';

const mockUseConfig = vi.fn();
const mockUseTwoFactorStatusQuery = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useConfig: () => mockUseConfig(),
    useMessages: () => ({
      t: (value: string) => value,
      labels: {
        security: 'Security',
        password: 'Password',
        changePassword: 'Change password',
        twoFactorAuth: 'Two-factor authentication',
        twoFactorActive: 'Active',
        twoFactorStatusNotConfigured: 'Not configured',
        twoFactorEnable: 'Enable',
      },
      messages: {
        twoFactorUserDescription: 'Protect your account with two-factor authentication.',
      },
    }),
    useTwoFactorStatusQuery: () => mockUseTwoFactorStatusQuery(),
  };
});

vi.mock('./PasswordChangeButton', () => ({
  PasswordChangeButton: () => <button data-test="password-change-button">Change password</button>,
}));

test('renders password change panel and 2fa panel when cloudMode is disabled', () => {
  mockUseConfig.mockReturnValue({ cloudMode: false });
  mockUseTwoFactorStatusQuery.mockReturnValue({
    data: { isEnabled: false, isRequired: false, isConfigured: true },
    isLoading: false,
  });

  render(<UserSecurityPage />);

  expect(screen.getByText('Security')).toBeInTheDocument();
  expect(screen.getByText('Password')).toBeInTheDocument();
  expect(screen.getByTestId('password-change-button')).toBeInTheDocument();
  expect(screen.getByText('Two-factor authentication')).toBeInTheDocument();
});

test('hides password panel when cloudMode is enabled', () => {
  mockUseConfig.mockReturnValue({ cloudMode: true });
  mockUseTwoFactorStatusQuery.mockReturnValue({
    data: { isEnabled: false, isRequired: false, isConfigured: true },
    isLoading: false,
  });

  render(<UserSecurityPage />);

  expect(screen.queryByTestId('password-change-button')).not.toBeInTheDocument();
  expect(screen.getByText('Two-factor authentication')).toBeInTheDocument();
});
