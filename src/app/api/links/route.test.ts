import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createLink } from '@/queries/prisma';
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
  createLink: vi.fn(),
  getUserLinks: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canCreateTeamWebsiteMock = vi.mocked(canCreateTeamWebsite);
const canCreateWebsiteMock = vi.mocked(canCreateWebsite);
const createLinkMock = vi.mocked(createLink);

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateTeamWebsiteMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createLinkMock.mockReset();
});

test('POST requires link slugs to be at least 8 characters so create matches edit validation', async () => {
  parseRequestMock.mockResolvedValue({
    auth: {
      user: {
        id: 'user-1',
      },
    },
    body: {
      name: 'Docs',
      url: 'https://example.com',
      slug: 'abcdefgh',
    },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  createLinkMock.mockResolvedValue({ id: 'link-1' } as any);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));
  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ name: 'Docs', url: 'https://example.com', slug: '1234567' }).success).toBe(
    false,
  );
  expect(schema.safeParse({ name: 'Docs', url: 'https://example.com', slug: '12345678' }).success).toBe(
    true,
  );
  expect(createLinkMock).toHaveBeenCalledWith({
    id: expect.any(String),
    name: 'Docs',
    url: 'https://example.com',
    slug: 'abcdefgh',
    teamId: undefined,
    userId: 'user-1',
  });
  expect(response.status).toBe(200);
});
