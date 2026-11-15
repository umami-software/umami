import { beforeEach, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { canUpdateLink } from '@/permissions';
import { updateLink } from '@/queries/prisma';
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
const canUpdateLinkMock = vi.mocked(canUpdateLink);
const updateLinkMock = vi.mocked(updateLink);

beforeEach(() => {
  vi.unstubAllEnvs();
  parseRequestMock.mockReset();
  canUpdateLinkMock.mockReset();
  updateLinkMock.mockReset();
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

test('POST accepts only a configured LINKS_URL entry as the base url', async () => {
  vi.stubEnv('LINKS_URL', 'https://example.com,https://go.example.org');
  parseRequestMock.mockResolvedValue({ error: () => new Response(null, { status: 400 }) } as any);

  await POST(new Request('http://localhost/api/links/link-1', { method: 'POST' }), {
    params: Promise.resolve({ linkId: 'link-1' }),
  });

  const schema = parseRequestMock.mock.calls[0][1] as {
    safeParse: (value: unknown) => { success: boolean };
  };

  expect(schema.safeParse({ baseUrl: 'https://go.example.org' }).success).toBe(true);
  expect(schema.safeParse({ baseUrl: null }).success).toBe(true);
  expect(schema.safeParse({ baseUrl: '' }).success).toBe(true);
  expect(schema.safeParse({ baseUrl: 'https://evil.example.net' }).success).toBe(false);
});

// An empty base url resets the link to the default; leaving it out keeps the saved one.
test('POST clears the base url when empty and keeps it when omitted', async () => {
  canUpdateLinkMock.mockResolvedValue(true);
  updateLinkMock.mockResolvedValue({ id: 'link-1' } as any);

  for (const [baseUrl, expected] of [
    ['', null],
    [undefined, undefined],
    ['https://go.example.org', 'https://go.example.org'],
  ]) {
    parseRequestMock.mockResolvedValueOnce({
      auth: { user: { id: 'user-1' } },
      body: { name: 'Docs', baseUrl },
      error: undefined,
    } as any);

    await POST(new Request('http://localhost/api/links/link-1', { method: 'POST' }), {
      params: Promise.resolve({ linkId: 'link-1' }),
    });

    expect(updateLinkMock).toHaveBeenLastCalledWith('link-1', {
      name: 'Docs',
      url: undefined,
      slug: undefined,
      baseUrl: expected,
    });
  }
});
