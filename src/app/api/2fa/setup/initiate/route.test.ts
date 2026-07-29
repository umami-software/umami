import { beforeEach, expect, test, vi } from 'vitest';
import { POST } from './route';

const mocks = vi.hoisted(() => ({
  parseRequest: vi.fn(),
  getUser: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  generateTotpSecret: vi.fn(),
  encryptSecret: vi.fn(),
  generateOtpAuthUri: vi.fn(),
  generateQrCodeDataUrl: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: mocks.parseRequest,
}));

vi.mock('@/queries/prisma/user', () => ({
  getUser: mocks.getUser,
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    client: {
      twoFactorAuth: {
        findUnique: mocks.findUnique,
        upsert: mocks.upsert,
      },
    },
  },
}));

vi.mock('@/lib/two-factor/crypto', () => ({
  encryptSecret: mocks.encryptSecret,
}));

vi.mock('@/lib/two-factor/totp', () => ({
  generateOtpAuthUri: mocks.generateOtpAuthUri,
  generateQrCodeDataUrl: mocks.generateQrCodeDataUrl,
  generateTotpSecret: mocks.generateTotpSecret,
}));

beforeEach(() => {
  mocks.parseRequest.mockReset();
  mocks.getUser.mockReset();
  mocks.findUnique.mockReset();
  mocks.upsert.mockReset();
  mocks.generateTotpSecret.mockReset();
  mocks.encryptSecret.mockReset();
  mocks.generateOtpAuthUri.mockReset();
  mocks.generateQrCodeDataUrl.mockReset();

  mocks.parseRequest.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    error: undefined,
  });
  mocks.getUser.mockResolvedValue({ id: 'user-1', username: 'alice' });
  mocks.findUnique.mockResolvedValue(null);
  mocks.generateTotpSecret.mockReturnValue('plain-secret');
  mocks.encryptSecret.mockReturnValue('encrypted-secret');
  mocks.generateOtpAuthUri.mockReturnValue('otpauth://alice');
  mocks.generateQrCodeDataUrl.mockResolvedValue('data:image/png;base64,qr');
  mocks.upsert.mockResolvedValue(undefined);
});

test('POST creates a pending 2FA setup and returns the manual key and QR data', async () => {
  const response = await POST(
    new Request('http://localhost/api/2fa/setup/initiate', { method: 'POST' }),
  );

  expect(mocks.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  expect(mocks.upsert).toHaveBeenCalledWith({
    where: { userId: 'user-1' },
    update: { secret: 'encrypted-secret', isEnabled: false },
    create: { userId: 'user-1', secret: 'encrypted-secret', isEnabled: false },
  });
  await expect(response.json()).resolves.toEqual({
    manualKey: 'plain-secret',
    qrCodeDataUrl: 'data:image/png;base64,qr',
  });
  expect(response.status).toBe(200);
});

test('POST rejects setup when 2FA is already enabled for the user', async () => {
  mocks.findUnique.mockResolvedValue({ userId: 'user-1', isEnabled: true });

  const response = await POST(
    new Request('http://localhost/api/2fa/setup/initiate', { method: 'POST' }),
  );

  expect(mocks.upsert).not.toHaveBeenCalled();
  await expect(response.json()).resolves.toMatchObject({
    error: {
      code: 'two-factor-error-already-enabled',
    },
  });
  expect(response.status).toBe(400);
});
