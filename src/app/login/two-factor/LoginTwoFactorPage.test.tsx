import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { LoginTwoFactorPage } from './LoginTwoFactorPage';

const mockVerify = vi.fn();

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: new Proxy({}, { get: (_, key) => String(key) }),
    messages: new Proxy({}, { get: (_, key) => String(key) }),
    getErrorMessage: () => 'Invalid code',
  }),
  useTwoFactorVerifyMutation: () => ({ mutateAsync: mockVerify, isPending: false }),
}));

beforeEach(() => {
  mockVerify.mockReset();
  sessionStorage.setItem('umami.partial-token', 'partial-token');
});

test('focuses the first code digit on load', () => {
  render(<LoginTwoFactorPage />);

  expect(screen.getByLabelText('Digit 1')).toHaveFocus();
});

test('clears a rejected code and focuses the first digit again', async () => {
  mockVerify.mockRejectedValue(new Error('Invalid code'));
  const { user } = render(<LoginTwoFactorPage />);

  await user.keyboard('123456');

  await waitFor(() => expect(screen.getByText('Invalid code')).toBeInTheDocument());
  expect(mockVerify).toHaveBeenCalledWith({
    partialToken: 'partial-token',
    token: '123456',
    backupCode: undefined,
  });
  expect(screen.getByLabelText('Digit 1')).toHaveValue('');
  expect(screen.getByLabelText('Digit 6')).toHaveValue('');
  expect(screen.getByLabelText('Digit 1')).toHaveFocus();
});

test('focuses the backup code field when switching to backup codes', async () => {
  const { user } = render(<LoginTwoFactorPage />);

  await user.click(screen.getByRole('button', { name: 'twoFactorUseBackup' }));

  expect(screen.getByLabelText('twoFactorBackupCode')).toHaveFocus();
});
