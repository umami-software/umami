import { beforeEach, expect, test, vi } from 'vitest';
import { isEntityIdInUse } from '@/lib/entity';
import { fetchAccount, fetchTeam } from '@/lib/load';
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

vi.mock('@/lib/load', () => ({
  fetchAccount: vi.fn(),
  fetchTeam: vi.fn(),
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
const fetchAccountMock = vi.mocked(fetchAccount);
const fetchTeamMock = vi.mocked(fetchTeam);

beforeEach(() => {
  parseRequestMock.mockReset();
  canCreateTeamWebsiteMock.mockReset();
  canCreateWebsiteMock.mockReset();
  createLinkMock.mockReset();
  isEntityIdInUseMock.mockReset();
  fetchAccountMock.mockReset();
  fetchTeamMock.mockReset();
  vi.unstubAllEnvs();
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

// Creating links on cloud is a paid feature; free plans keep the links they already have.
const createAs = async (plan: object | null, teamId?: string) => {
  vi.stubEnv('CLOUD_MODE', '1');
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Docs', url: 'https://example.com', slug: 'abcdefgh', teamId },
    error: undefined,
  });
  fetchAccountMock.mockResolvedValue(teamId ? { hasSubscription: true } : plan);
  fetchTeamMock.mockResolvedValue(plan);
  canCreateWebsiteMock.mockResolvedValue(true);
  canCreateTeamWebsiteMock.mockResolvedValue(true);
  createLinkMock.mockResolvedValue({ id: 'link-1' } as any);

  return POST(new Request('http://localhost/api/links', { method: 'POST' }));
};

test('POST refuses a cloud link for a free plan without creating it', async () => {
  const response = await createAs({ hasSubscription: false });

  expect(response.status).toBe(403);
  expect(createLinkMock).not.toHaveBeenCalled();
});

test('POST refuses a cloud link when the plan cannot be loaded', async () => {
  const response = await createAs(null);

  expect(response.status).toBe(403);
  expect(createLinkMock).not.toHaveBeenCalled();
});

test('POST creates cloud links for paid plans and accounts without billing', async () => {
  expect((await createAs({ hasSubscription: true, isPro: true })).status).toBe(200);
  expect((await createAs({ hasSubscription: true, isBusiness: true })).status).toBe(200);
  expect((await createAs({ isNoBilling: true })).status).toBe(200);
  expect(createLinkMock).toHaveBeenCalledTimes(3);
});

// The team pays for team links, so a paid user in a free team must not get them.
test('POST judges a cloud team link by the team plan, not the user plan', async () => {
  const response = await createAs({ hasSubscription: false }, 'team-1');

  expect(fetchTeamMock).toHaveBeenCalledWith('team-1');
  expect(response.status).toBe(403);
  expect(createLinkMock).not.toHaveBeenCalled();
});

// Answering "Pro subscription required" to a stranger would tell them the team is on a free plan.
test('POST refuses a cloud team link to a non-member without revealing the team plan', async () => {
  vi.stubEnv('CLOUD_MODE', '1');
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Docs', url: 'https://example.com', slug: 'abcdefgh', teamId: 'team-1' },
    error: undefined,
  });
  canCreateTeamWebsiteMock.mockResolvedValue(false);
  fetchTeamMock.mockResolvedValue({ hasSubscription: false });

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(response.status).toBe(401);
  expect(fetchTeamMock).not.toHaveBeenCalled();
  expect(createLinkMock).not.toHaveBeenCalled();
});

test('POST does not check plans outside cloud mode', async () => {
  parseRequestMock.mockResolvedValue({
    auth: { user: { id: 'user-1' } },
    body: { name: 'Docs', url: 'https://example.com', slug: 'abcdefgh' },
    error: undefined,
  });
  canCreateWebsiteMock.mockResolvedValue(true);
  createLinkMock.mockResolvedValue({ id: 'link-1' } as any);

  const response = await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  expect(fetchAccountMock).not.toHaveBeenCalled();
  expect(response.status).toBe(200);
});

// A relative url passes a plain string check, then the /q redirect records a click and fails.
test('POST accepts only absolute link urls, matching the link form', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);

  await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };
  const body = (url: string) => ({ name: 'Docs', url, slug: 'abcdefgh' });

  expect(schema.safeParse(body('https://example.com/docs')).success).toBe(true);
  expect(schema.safeParse(body('mailto:hi@example.com')).success).toBe(true);
  expect(schema.safeParse(body('myapp://open')).success).toBe(true);
  expect(schema.safeParse(body('foo')).success).toBe(false);
  expect(schema.safeParse(body('/relative/path')).success).toBe(false);
  expect(schema.safeParse(body('')).success).toBe(false);
});

// The API is a way to create links without the form, so it must refuse the same unsafe
// destinations the form does.
test('POST refuses unsafe link destinations, and ip hosts only in cloud mode', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);
  const body = (url: string) => ({ name: 'Docs', url, slug: 'abcdefgh' });
  const getSchema = async () => {
    parseRequestMock.mockClear();
    await POST(new Request('http://localhost/api/links', { method: 'POST' }));

    return parseRequestMock.mock.calls[0][1] as {
      safeParse: (value: unknown) => { success: boolean };
    };
  };

  vi.stubEnv('CLOUD_MODE', '');
  const selfHosted = await getSchema();

  expect(selfHosted.safeParse(body('javascript:alert(1)')).success).toBe(false);
  expect(selfHosted.safeParse(body('https://bank.com@evil.example')).success).toBe(false);
  expect(selfHosted.safeParse(body('http://192.168.1.10/wiki')).success).toBe(true);

  vi.stubEnv('CLOUD_MODE', '1');
  const cloud = await getSchema();

  expect(cloud.safeParse(body('http://203.0.113.7/login')).success).toBe(false);
  expect(cloud.safeParse(body('https://example.com/docs')).success).toBe(true);

  vi.unstubAllEnvs();
});

// Pasted urls often carry surrounding spaces; store the url the redirect will actually use.
test('POST trims surrounding whitespace from link urls', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);

  await POST(new Request('http://localhost/api/links', { method: 'POST' }));

  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean; data?: { url: string } };
  };
  const result = schema.safeParse({
    name: 'Docs',
    url: ' https://example.com/docs ',
    slug: 'abcdefgh',
  });

  expect(result.data?.url).toBe('https://example.com/docs');
  expect(schema.safeParse({ name: 'Docs', url: '   ', slug: 'abcdefgh' }).success).toBe(false);
});
