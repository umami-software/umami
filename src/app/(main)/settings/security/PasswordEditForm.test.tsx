import { expect, test, vi } from 'vitest';
import { setClientAuthToken } from '@/lib/client';
import { render, screen, userEvent, waitFor } from '@/test/render';
import { PasswordEditForm } from './PasswordEditForm';

const mockMutateAsync = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useUpdateQuery: () => ({ mutateAsync: mockMutateAsync, error: null, isPending: false }),
  };
});

vi.mock('@/lib/client', () => ({
  setClientAuthToken: vi.fn(),
}));

test('switches to the session issued for the new password after saving', async () => {
  // The server invalidates the old token when the password changes; without storing the new one
  // every later request would fail.
  mockMutateAsync.mockImplementation(async (_data, { onSuccess }) => {
    await onSuccess({ id: 'user-1', token: 'new-session-token' });
  });
  const onSave = vi.fn();

  render(<PasswordEditForm onSave={onSave} required={true} />);

  await userEvent.type(await screen.findByLabelText('Current password'), 'umami');
  await userEvent.type(screen.getByLabelText('New password'), 'new-password');
  await userEvent.type(screen.getByLabelText('Confirm password'), 'new-password');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(setClientAuthToken).toHaveBeenCalledWith('new-session-token'));
  expect(onSave).toHaveBeenCalled();
});

test('keeps the stored token when the server does not return a new one', async () => {
  // An API older than this frontend responds without a token. Storing "undefined" would replace
  // the user's token with garbage; leaving it lets the normal sign-in redirect handle the change.
  mockMutateAsync.mockImplementation(async (_data, { onSuccess }) => {
    await onSuccess({ id: 'user-1' });
  });
  const onSave = vi.fn();

  render(<PasswordEditForm onSave={onSave} required={true} />);

  await userEvent.type(await screen.findByLabelText('Current password'), 'umami');
  await userEvent.type(screen.getByLabelText('New password'), 'new-password');
  await userEvent.type(screen.getByLabelText('Confirm password'), 'new-password');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() => expect(onSave).toHaveBeenCalled());
  expect(setClientAuthToken).not.toHaveBeenCalled();
});

test('cannot be cancelled when the password change is required', async () => {
  render(<PasswordEditForm onSave={vi.fn()} required={true} />);

  expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
});
