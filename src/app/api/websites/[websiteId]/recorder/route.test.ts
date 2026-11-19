import { beforeEach, describe, expect, test, vi } from 'vitest';
import { parseRequest } from '@/lib/request';
import { getWebsite } from '@/queries/prisma';
import { GET, OPTIONS } from './route';

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsite: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);
const getWebsiteMock = vi.mocked(getWebsite);

beforeEach(() => {
  vi.clearAllMocks();
  parseRequestMock.mockResolvedValue({ error: undefined });
});

describe('recorder config route CORS', () => {
  test('handles preflight requests', async () => {
    const response = OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('x-umami-cache');
  });

  test('includes CORS headers on config responses', async () => {
    getWebsiteMock.mockResolvedValue(null as any);

    const response = await GET(new Request('http://localhost/api/websites/test/recorder'), {
      params: Promise.resolve({ websiteId: '11111111-1111-4111-8111-111111111111' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Cache-Control')).toContain('max-age=60');
  });
});
