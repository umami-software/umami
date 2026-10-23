import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { LoginTwoFactorPage } from './LoginTwoFactorPage';

const mockVerify = vi.fn();

vi.mock('@/components/hooks', async () => {
  const { useState } = await import('react');

  return {
    useMessages: () => ({
      t: (value: string) => value,
      labels: new Proxy({}, { get: (_, key) => String(key) }),
      messages: new Proxy({}, { get: (_, key) => String(key) }),
      getErrorMessage: () => 'Invalid code',
    }),
    // Tracks isPending like the real mutation hook.
    useTwoFactorVerifyMutation: () => {
      const [isPending, setIsPending] = useState(false);

      const mutateAsync = async (data: unknown) => {
        setIsPending(true);
        try {
          return await mockVerify(data);
        } finally {
          setIsPending(false);
        }
      };

      return { mutateAsync, isPending };
    },
  };
});

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

test('keeps focus on the code while it is being verified', async () => {
  let rejectVerify: (error: Error) => void = () => {};
  mockVerify.mockReturnValue(
    new Promise((_, reject) => {
      rejectVerify = reject;
    }),
  );
  const { user } = render(<LoginTwoFactorPage />);

  await user.keyboard('123456');

  const lastDigit = screen.getByLabelText('Digit 6');
  expect(lastDigit).toHaveAttribute('readonly');
  expect(lastDigit).not.toBeDisabled();
  expect(lastDigit).toHaveFocus();

  rejectVerify(new Error('Invalid code'));

  await waitFor(() => expect(screen.getByLabelText('Digit 1')).toHaveFocus());
  expect(screen.getByLabelText('Digit 6')).not.toHaveAttribute('readonly');
});

test('focuses the backup code field when switching to backup codes', async () => {
  const { user } = render(<LoginTwoFactorPage />);

  await user.click(screen.getByRole('button', { name: 'twoFactorUseBackup' }));

  expect(screen.getByLabelText('twoFactorBackupCode')).toHaveFocus();
});
