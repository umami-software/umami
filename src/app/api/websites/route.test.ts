import { beforeEach, expect, test, vi } from 'vitest';
import { isEntityIdInUse } from '@/lib/entity';
import { parseRequest } from '@/lib/request';
import { canCreateWebsite } from '@/permissions';
import { createWebsite } from '@/queries/prisma';
import { POST } from './route';

vi.mock('@/lib/entity', () => ({
  isEntityIdInUse: vi.fn(),
}));

vi.mock('@/lib/load', () => ({
  fetchAccount: vi.fn(),
  fetchTeam: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  getQueryFilters: vi.fn(),
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canCreateTeamWebsite: vi.fn(),
  canCreateWebsite: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  createShare: vi.fn(),
  createWebsite: vi.fn(),
  getTeamWebsiteCount: vi.fn(),
  getWebsiteCount: vi.fn(),
}));

vi.mock('@/queries/prisma/website', () => ({
  getAllUserWebsitesIncludingTeamAccess: vi.fn(),
  getUserWebsites: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const canCreateWebsiteMock = vi.mocked(canCreateWebsite);
const createWebsiteMock = vi.mocked(createWebsite);
const isEntityIdInUseMock = vi.mocked(isEntityIdInUse);

const entityId = '9b27b8ed-d01f-4a51-acaf-7b68f333431e';

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createWebsiteMock.mockReset();
  isEntityIdInUseMock.mockReset();
});

// Authorization resolves an id across websites, links, pixels and boards, so a
// website created with another tenant's pixel/link/board id would shadow it.
test('POST rejects a caller-supplied id already used by another entity', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'attacker' } },
    body: { id: entityId, name: 'shadow', domain: 'attacker.example' },
    error: undefined,
  } as any);
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(true);

  const response = await POST(new Request('http://localhost/api/websites', { method: 'POST' }));

  expect(isEntityIdInUseMock).toHaveBeenCalledWith(entityId);
  expect(createWebsiteMock).not.toHaveBeenCalled();
  expect(response.status).toBe(400);
});

// Caller-supplied ids are supported so a website can keep its id across instances.
test('POST keeps a caller-supplied id when no entity uses it', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { id: entityId, name: 'Site', domain: 'example.com' },
    error: undefined,
  } as any);
  canCreateWebsiteMock.mockResolvedValue(true);
  isEntityIdInUseMock.mockResolvedValue(false);
  createWebsiteMock.mockResolvedValue({ id: entityId, name: 'Site' } as any);

  const response = await POST(new Request('http://localhost/api/websites', { method: 'POST' }));

  expect(createWebsiteMock).toHaveBeenCalledWith(expect.objectContaining({ id: entityId }));
  expect(response.status).toBe(200);
});

test('POST generates an id without an entity lookup when none is supplied', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Site', domain: 'example.com' },
    error: undefined,
  } as any);
  canCreateWebsiteMock.mockResolvedValue(true);
  createWebsiteMock.mockResolvedValue({ id: 'generated', name: 'Site' } as any);

  const response = await POST(new Request('http://localhost/api/websites', { method: 'POST' }));

  expect(isEntityIdInUseMock).not.toHaveBeenCalled();
  expect(createWebsiteMock).toHaveBeenCalledWith(
    expect.objectContaining({ id: expect.any(String) }),
  );
  expect(response.status).toBe(200);
});
