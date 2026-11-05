import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';

const mocks = vi.hoisted(() => ({
  browserSupportsWebAuthn: vi.fn(),
  registerSecurityKey: vi.fn(),
  updateQuery: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  browserSupportsWebAuthn: mocks.browserSupportsWebAuthn,
}));

vi.mock('@/components/hooks', () => ({
  useMessages: () => ({
    t: (value: string) => value,
    labels: new Proxy({}, { get: (_, key) => String(key) }),
    messages: new Proxy({}, { get: (_, key) => String(key) }),
    getErrorMessage: () => undefined,
  }),
  useUpdateQuery: (path: string) => ({
    mutate: (data: unknown) => mocks.updateQuery(path, data),
    mutateAsync: async (data: unknown) => mocks.updateQuery(path, data),
    isPending: false,
  }),
  useSecurityKeyRegisterMutation: () => ({
    mutateAsync: mocks.registerSecurityKey,
    error: null,
    isPending: false,
  }),
}));

beforeEach(() => {
  for (const mock of Object.values(mocks)) {
    mock.mockReset();
  }

  mocks.browserSupportsWebAuthn.mockReturnValue(true);
});

test('offers a security key when two-factor setup is required', async () => {
  const { user } = render(<TwoFactorSetupModal required={true} />);

  await user.click(screen.getByRole('button', { name: 'addSecurityKey' }));
  await user.type(screen.getByRole('textbox', { name: 'name' }), 'YubiKey');
  await user.click(screen.getByRole('button', { name: 'continue' }));

  await waitFor(() => expect(mocks.registerSecurityKey).toHaveBeenCalledWith({ name: 'YubiKey' }));
  expect(mocks.updateQuery).toHaveBeenCalledWith('/2fa/setup/cancel', {});
});

test('returns to authenticator app setup when the security key form is cancelled', async () => {
  const { user } = render(<TwoFactorSetupModal required={true} />);

  await user.click(screen.getByRole('button', { name: 'addSecurityKey' }));
  await user.click(screen.getByRole('button', { name: 'cancel' }));

  expect(screen.getByText('twoFactorScanQr')).toBeInTheDocument();
  expect(mocks.registerSecurityKey).not.toHaveBeenCalled();
});

test('does not offer a security key when setup is optional', () => {
  render(<TwoFactorSetupModal required={false} />);

  expect(screen.queryByRole('button', { name: 'addSecurityKey' })).not.toBeInTheDocument();
});

test('does not offer a security key when the browser lacks WebAuthn', () => {
  mocks.browserSupportsWebAuthn.mockReturnValue(false);

  render(<TwoFactorSetupModal required={true} />);

  expect(screen.queryByRole('button', { name: 'addSecurityKey' })).not.toBeInTheDocument();
});
