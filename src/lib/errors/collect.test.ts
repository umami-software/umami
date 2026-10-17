import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  findUnique: vi.fn(),
  getClientInfo: vi.fn(),
  recordErrorIngestion: vi.fn(),
  saveError: vi.fn(),
}));

vi.mock('isbot', () => ({ isbot: () => false }));
vi.mock('@/lib/clickhouse', () => ({ default: { enabled: false } }));
vi.mock('@/lib/collection-session', () => ({
  resolveCollectionSession: () => ({
    sessionId: '00000000-0000-4000-8000-000000000002',
    visitId: '00000000-0000-4000-8000-000000000003',
    iat: 1,
  }),
}));
vi.mock('@/lib/cors', () => ({ withCorsHeaders: (response: Response) => response }));
vi.mock('@/lib/crypto', () => ({ secret: () => 'secret' }));
vi.mock('@/lib/detect', () => ({
  getClientInfo: mocks.getClientInfo,
  hasBlockedIp: () => false,
}));
vi.mock('@/lib/errors/metrics', () => ({ recordErrorIngestion: mocks.recordErrorIngestion }));
vi.mock('@/lib/jwt', () => ({ createToken: () => 'cache-token', parseToken: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  default: { client: { website: { findUnique: mocks.findUnique } } },
}));
vi.mock('@/queries/sql/errors/store', () => ({
  consumeErrorQuota: async () => true,
  saveError: mocks.saveError,
}));
vi.mock('@/queries/sql/sessions/createSession', () => ({ createSession: mocks.createSession }));

import { collectError } from './collect';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findUnique.mockResolvedValue({
    id: '00000000-0000-4000-8000-000000000001',
    deletedAt: null,
    resetAt: null,
  });
  mocks.getClientInfo.mockResolvedValue({ ip: '127.0.0.1', userAgent: 'Mozilla/5.0' });
  mocks.saveError.mockResolvedValue({
    eventId: '00000000-0000-4000-8000-000000000004',
    issueId: '00000000-0000-4000-8000-000000000005',
  });
});

const payload = {
  version: 1 as const,
  website: '00000000-0000-4000-8000-000000000001',
  eventId: '00000000-0000-4000-8000-000000000004',
  timestamp: Date.now(),
  name: 'Error',
  message: 'Checkout failed',
  stack: '',
  handled: false,
  url: '/checkout',
  release: '',
  environment: 'production',
  tags: {},
};

function createRequest(body = payload) {
  return new Request('https://analytics.example.com/api/send', {
    method: 'POST',
    body: JSON.stringify({ type: 'error', payload: body }),
  });
}

// The tracker's data-errors attribute is the only switch; there is no website setting to check.
test('accepts browser errors for any existing website', async () => {
  const response = await collectError(createRequest(), payload);

  expect(response.status).toBe(200);
  expect(mocks.saveError).toHaveBeenCalledWith(
    payload,
    expect.objectContaining({ sessionId: '00000000-0000-4000-8000-000000000002' }),
  );
});

// Errors are kept like other analytics data, so age alone never rejects a retried error.
test('accepts old errors because there is no retention window', async () => {
  const old = { ...payload, timestamp: Date.now() - 365 * 86400000 };

  const response = await collectError(createRequest(old), old);

  expect(response.status).toBe(200);
  expect(mocks.saveError).toHaveBeenCalled();
});

// A reset clears website data, so errors from before it must not reappear.
test('rejects errors that occurred before the website was reset', async () => {
  mocks.findUnique.mockResolvedValueOnce({
    id: payload.website,
    deletedAt: null,
    resetAt: new Date(),
  });
  const old = { ...payload, timestamp: Date.now() - 60000 };

  const response = await collectError(createRequest(old), old);

  expect(response.status).toBe(400);
  expect(mocks.saveError).not.toHaveBeenCalled();
});
