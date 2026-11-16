import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { POST } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/permissions', () => ({
  canDeleteLink: vi.fn(),
  canUpdateLink: vi.fn(),
  canViewLink: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  deleteLink: vi.fn(),
  getLink: vi.fn(),
  updateLink: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);

beforeEach(() => {
  parseRequestMock.mockReset();
});

// Updates must apply the same url rule as create, or a relative url can still be saved.
test('POST accepts only absolute link urls and keeps url optional', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);

  await POST(new Request('http://localhost/api/links/link-1', { method: 'POST' }), {
    params: Promise.resolve({ linkId: 'link-1' }),
  });

  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ name: 'Docs' }).success).toBe(true);
  expect(schema.safeParse({ url: 'https://example.com' }).success).toBe(true);
  expect(schema.safeParse({ url: 'foo' }).success).toBe(false);
});

// Otherwise an existing link could be edited to point somewhere create would refuse.
test('POST refuses unsafe link destinations, and ip hosts only in cloud mode', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);
  const getSchema = async () => {
    parseRequestMock.mockClear();
    await POST(new Request('http://localhost/api/links/link-1', { method: 'POST' }), {
      params: Promise.resolve({ linkId: 'link-1' }),
    });

    return parseRequestMock.mock.calls[0][1] as {
      safeParse: (value: unknown) => { success: boolean };
    };
  };

  vi.stubEnv('CLOUD_MODE', '');
  const selfHosted = await getSchema();

  expect(selfHosted.safeParse({ url: 'data:text/html,<h1>Sign in</h1>' }).success).toBe(false);
  expect(selfHosted.safeParse({ url: 'https://bank.com@evil.example' }).success).toBe(false);
  expect(selfHosted.safeParse({ url: 'http://192.168.1.10/wiki' }).success).toBe(true);

  vi.stubEnv('CLOUD_MODE', '1');
  const cloud = await getSchema();

  expect(cloud.safeParse({ url: 'http://203.0.113.7/login' }).success).toBe(false);
  expect(cloud.safeParse({ name: 'Docs' }).success).toBe(true);

  vi.unstubAllEnvs();
});

test('POST trims surrounding whitespace from link urls', async () => {
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);

  await POST(new Request('http://localhost/api/links/link-1', { method: 'POST' }), {
    params: Promise.resolve({ linkId: 'link-1' }),
  });

  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { data?: { url?: string } };
  };

  expect(schema.safeParse({ url: ' https://example.com ' }).data?.url).toBe('https://example.com');
});
