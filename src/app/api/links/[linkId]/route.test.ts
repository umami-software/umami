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
