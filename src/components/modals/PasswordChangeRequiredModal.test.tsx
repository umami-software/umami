import { expect, test, vi } from 'vitest';
import { render, screen, userEvent } from '@/test/render';
import { PasswordChangeRequiredModal } from './PasswordChangeRequiredModal';

const mockSetUser = vi.fn();

vi.mock('@/components/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/components/hooks')>('@/components/hooks');

  return {
    ...actual,
    useLoginQuery: () => ({
      user: { id: 'admin-1', passwordChangeRequired: true },
      setUser: mockSetUser,
    }),
  };
});

vi.mock('@/app/(main)/settings/security/PasswordEditForm', () => ({
  PasswordEditForm: ({ onSave, required }: { onSave: () => void; required?: boolean }) => (
    <button type="button" data-required={String(required)} onClick={onSave}>
      Save password
    </button>
  ),
}));

test('explains why the default password must be replaced and cannot be dismissed', async () => {
  render(<PasswordChangeRequiredModal />);

  expect(await screen.findByText(/Let's secure your account/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save password' })).toHaveAttribute(
    'data-required',
    'true',
  );
});

test('unblocks the app in place once the password is changed', async () => {
  // The user stays signed in, so the app must drop the block instead of sending them back to
  // the login page.
  render(<PasswordChangeRequiredModal />);

  await userEvent.click(await screen.findByRole('button', { name: 'Save password' }));

  expect(mockSetUser).toHaveBeenCalledWith({ id: 'admin-1', passwordChangeRequired: false });
});
