import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createPixel } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
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

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateTeamWebsiteMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createPixelMock.mockReset();
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
