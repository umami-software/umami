import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { deleteShare, getShare, updateShare } from '@/queries/prisma';
import { DELETE, GET, POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteEntity: vi.fn(),
  canUpdateEntity: vi.fn().mockResolvedValue(true),
  canViewEntity: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  deleteShare: vi.fn(),
  getShare: vi.fn().mockResolvedValue({ id: 'share-1', entityId: 'website-1' }),
  updateShare: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const updateShareMock = vi.mocked(updateShare);

const context = { params: Promise.resolve({ shareId: 'share-1' }) };

// An unknown id is a missing resource, not a server crash, and must not reach the delete.
test('GET and DELETE return 404 for an unknown share', async () => {
  vi.mocked(getShare).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

  const getResponse = await GET(new Request('http://localhost/api/share/id/share-1'), context);
  const deleteResponse = await DELETE(
    new Request('http://localhost/api/share/id/share-1', { method: 'DELETE' }),
    context,
  );

  expect(getResponse.status).toBe(404);
  expect(deleteResponse.status).toBe(404);
  expect(deleteShare).not.toHaveBeenCalled();
});

beforeEach(() => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Public', slug: 'taken', parameters: {} },
  } as any);
  updateShareMock.mockReset();
});

// Renaming a share to an existing slug is user input to fix, not a server failure.
test('POST returns 400 when the slug is already taken', async () => {
  updateShareMock.mockRejectedValue(new Error('Unique constraint failed on the fields: (`slug`)'));

  const response = await POST(
    new Request('http://localhost/api/share/id/share-1', { method: 'POST' }),
    context,
  );

  expect(response.status).toBe(400);
  expect((await response.json()).error.message).toBe('That slug is already taken.');
});

test('POST still returns 500 for other database errors', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  updateShareMock.mockRejectedValue(new Error('Connection refused'));

  const response = await POST(
    new Request('http://localhost/api/share/id/share-1', { method: 'POST' }),
    context,
  );

  expect(response.status).toBe(500);
});
