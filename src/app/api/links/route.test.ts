import { beforeEach, expect, test, vi } from 'vitest';
import { isEntityIdInUse } from '@/lib/entity';
import { parseRequest } from '@/lib/request';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createLink } from '@/queries/prisma';
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
  createLink: vi.fn(),
  getUserLinks: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canCreateTeamWebsiteMock = vi.mocked(canCreateTeamWebsite);
const canCreateWebsiteMock = vi.mocked(canCreateWebsite);
const createLinkMock = vi.mocked(createLink);
const isEntityIdInUseMock = vi.mocked(isEntityIdInUse);

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateTeamWebsiteMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createLinkMock.mockReset();
  isEntityIdInUseMock.mockReset();
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

const entityId = '9b27b8ed-d01f-4a51-acaf-7b68f333431e';

// Authorization resolves an id across websites, links, pixels and boards, so a
// link created with another tenant's website/pixel/board id would shadow it.
test('POST rejects a caller-supplied id already used by another entity', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'attacker' } },
    body: { id: entityId, name: 'Docs', url: 'https://example.com', slug: 'abcdefgh' },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(true);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(isEntityIdInUseMock).toHaveBeenCalledWith(entityId);
  expect(createLinkMock).not.toHaveBeenCalled();
  expect(response.status).toBe(400);
});

test('POST keeps a caller-supplied id when no entity uses it', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { id: entityId, name: 'Docs', url: 'https://example.com', slug: 'abcdefgh' },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(false);
  createLinkMock.mockResolvedValue({ id: entityId } as any);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(createLinkMock).toHaveBeenCalledWith(expect.objectContaining({ id: entityId }));
  expect(response.status).toBe(200);
});

// Team links depend only on team permission; a past-due personal account must not block them.
test('POST creates a team link from the team check alone', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Docs', url: 'https://example.com', slug: 'abcdefgh', teamId: 'team-1' },
    error: undefined,
  });
  canCreateTeamWebsiteMock.mockResolvedValue(true);
  canCreateWebsiteMock.mockResolvedValue(false);
  createLinkMock.mockResolvedValue({ id: 'link-1' } as any);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(canCreateTeamWebsiteMock).toHaveBeenCalledWith(expect.anything(), 'team-1');
  expect(createLinkMock).toHaveBeenCalledWith(expect.objectContaining({ teamId: 'team-1' }));
  expect(response.status).toBe(200);
});

test('POST rejects a team link when the team check fails', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Docs', url: 'https://example.com', slug: 'abcdefgh', teamId: 'team-1' },
    error: undefined,
  });
  canCreateTeamWebsiteMock.mockResolvedValue(false);
  canCreateWebsiteMock.mockResolvedValue(true);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(createLinkMock).not.toHaveBeenCalled();
  expect(response.status).toBe(401);
});
