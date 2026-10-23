import { beforeEach, expect, test, vi } from 'vitest';
import { isEntityIdInUse } from '@/lib/entity';
import { parseRequest } from '@/lib/request';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createPixel } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/lib/entity', () => ({
  isEntityIdInUse: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canCreateTeamWebsite: vi.fn(),
  canCreateWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createPixel: vi.fn(),
  getUserPixels: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canCreateTeamWebsiteMock = vi.mocked(canCreateTeamWebsite);
const canCreateWebsiteMock = vi.mocked(canCreateWebsite);
const createPixelMock = vi.mocked(createPixel);
const isEntityIdInUseMock = vi.mocked(isEntityIdInUse);

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateTeamWebsiteMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createPixelMock.mockReset();
  isEntityIdInUseMock.mockReset();
});

test('POST requires pixel slugs to be at least 8 characters so create matches edit validation', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'user-1',
      },
    },
    body: {
      name: 'Pixel',
      slug: 'abcdefgh',
    },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  createPixelMock.mockResolvedValue({ id: 'pixel-1' } as any);

  const response = await POST(new Request('http://localhost/api/pixels', { method: 'POST' }));
  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ name: 'Pixel', slug: '1234567' }).success).toBe(false);
  expect(schema.safeParse({ name: 'Pixel', slug: '12345678' }).success).toBe(true);
  expect(createPixelMock).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Pixel',
    slug: 'abcdefgh',
    teamId: undefined,
    userId: 'user-1',
  });
  expect(response.status).toBe(200);
});

const entityId = '9b27b8ed-d01f-4a51-acaf-7b68f333431e';

// Authorization resolves an id across websites, links, pixels and boards, so a
// pixel created with another tenant's website/link/board id would shadow it.
test('POST rejects a caller-supplied id already used by another entity', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'attacker' } },
    body: { id: entityId, name: 'Pixel', slug: 'abcdefgh' },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(true);

  const response = await POST(new Request('http://localhost/api/pixels', { method: 'POST' }));

  expect(isEntityIdInUseMock).toHaveBeenCalledWith(entityId);
  expect(createPixelMock).not.toHaveBeenCalled();
  expect(response.status).toBe(400);
});

test('POST keeps a caller-supplied id when no entity uses it', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { id: entityId, name: 'Pixel', slug: 'abcdefgh' },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(false);
  createPixelMock.mockResolvedValue({ id: entityId } as any);

  const response = await POST(new Request('http://localhost/api/pixels', { method: 'POST' }));

  expect(createPixelMock).toHaveBeenCalledWith(expect.objectContaining({ id: entityId }));
  expect(response.status).toBe(200);
});
