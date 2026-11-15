import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { createShare } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canUpdateEntity: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/queries/prisma', () => ({
  createShare: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const createShareMock = vi.mocked(createShare);

beforeEach(() => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: {
      entityId: '11111111-1111-4111-8111-111111111111',
      shareType: 1,
      name: 'Public',
      slug: 'taken',
      parameters: {},
    },
  } as any);
  createShareMock.mockReset();
});

// Slugs are unique; a collision is user input to fix, not a server failure.
test('POST returns 400 when the slug is already taken', async () => {
  createShareMock.mockRejectedValue(new Error('Unique constraint failed on the fields: (`slug`)'));

  const response = await POST(new Request('http://localhost/api/share', { method: 'POST' }));

  expect(response.status).toBe(400);
  expect((await response.json()).error.message).toBe('That slug is already taken.');
});

test('POST still returns 500 for other database errors', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  createShareMock.mockRejectedValue(new Error('Connection refused'));

  const response = await POST(new Request('http://localhost/api/share', { method: 'POST' }));

  expect(response.status).toBe(500);
});
