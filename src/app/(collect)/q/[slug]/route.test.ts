import { beforeEach, expect, test, vi } from 'vitest';
import { POST as sendPost } from '@/app/api/send/route';
import { findLink } from '@/queries/prisma';
import { GET } from './route';

vi.mock('@/app/api/send/route', () => ({
  POST: vi.fn(),
}));

vi.mock('@/lib/redis', () => ({
  default: { enabled: false },
}));

vi.mock('@/queries/prisma', () => ({
  findLink: vi.fn(),
}));

const findLinkMock = vi.mocked(findLink);
const sendPostMock = vi.mocked(sendPost);

const request = () => new Request('http://localhost/q/abcdefgh');
const params = { params: Promise.resolve({ slug: 'abcdefgh' }) };

beforeEach(() => {
  findLinkMock.mockReset();
  sendPostMock.mockReset().mockResolvedValue(new Response('{}'));
});

test('GET records the click and redirects to the link url', async () => {
  findLinkMock.mockResolvedValue({ id: 'link-1', url: 'https://example.com/docs' } as any);

  const response = await GET(request(), params);

  expect(sendPostMock).toHaveBeenCalledTimes(1);
  expect(response.status).toBe(307);
  expect(response.headers.get('location')).toBe('https://example.com/docs');
});

// Links saved before the API validated urls can be relative; they used to record a click and then 500.
test('GET returns 404 without recording a click for a stored relative url', async () => {
  findLinkMock.mockResolvedValue({ id: 'link-1', url: 'foo' } as any);

  const response = await GET(request(), params);

  expect(sendPostMock).not.toHaveBeenCalled();
  expect(response.status).toBe(404);
});
