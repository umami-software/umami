import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { parseToken } from '@/lib/jwt';
import { parseRequest } from '@/lib/request';
import { getWebsite } from '@/queries/prisma';
import { saveRecording } from '@/queries/sql';
import { OPTIONS, POST } from './route';

vi.mock('@/lib/detect', () => ({
  getClientInfo: vi.fn(),
  hasBlockedIp: vi.fn(),
}));

vi.mock('@/lib/jwt', () => ({
  parseToken: vi.fn(),
}));

vi.mock('@/lib/request', () => ({
  parseRequest: vi.fn(),
}));

vi.mock('@/queries/prisma', () => ({
  getWebsite: vi.fn(),
}));

vi.mock('@/queries/sql', () => ({
  saveRecording: vi.fn(),
}));

vi.mock('@/queries/sql/heatmap/saveHeatmapEvents', () => ({
  saveHeatmapEvents: vi.fn(),
}));

const parseRequestMock = vi.mocked(parseRequest);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('record route CORS', () => {
  test('handles preflight requests', async () => {
    const response = OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('x-umami-cache');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });

  test('includes CORS headers on post responses', async () => {
    parseRequestMock.mockResolvedValue({
      body: {
        type: 'record',
        payload: {
          website: '11111111-1111-4111-8111-111111111111',
          events: [],
        },
      },
      error: undefined,
    });

    const response = await POST(
      new Request('http://localhost/api/record', {
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});

describe('record route cache token binding', () => {
  const websiteId = '11111111-1111-4111-8111-111111111111';
  const otherWebsiteId = '22222222-2222-4222-8222-222222222222';
  const sessionId = '33333333-3333-4333-8333-333333333333';
  const visitId = '44444444-4444-4444-8444-444444444444';

  function post(website: string) {
    parseRequestMock.mockResolvedValue({
      body: {
        type: 'record',
        payload: { website, events: [{ type: 3, timestamp: 1_700_000_000_000 }] },
      },
      error: undefined,
    } as any);

    return POST(
      new Request('http://localhost/api/record', {
        method: 'POST',
        headers: { 'x-umami-cache': 'token' },
      }),
    );
  }

  beforeEach(() => {
    vi.mocked(getWebsite).mockResolvedValue({
      id: websiteId,
      recorderEnabled: true,
      replayConfig: { replayEnabled: true },
    } as any);
    vi.mocked(getClientInfo).mockResolvedValue({
      ip: '127.0.0.1',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    } as any);
    vi.mocked(hasBlockedIp).mockReturnValue(false);
  });

  test('rejects a cache token issued for a different website', async () => {
    vi.mocked(parseToken).mockResolvedValue({
      type: 'cache',
      websiteId: otherWebsiteId,
      sessionId,
      visitId,
    });

    const response = await post(websiteId);

    expect(response.status).toBe(400);
    expect(getWebsite).not.toHaveBeenCalled();
    expect(saveRecording).not.toHaveBeenCalled();
  });

  test('rejects a token without a websiteId', async () => {
    vi.mocked(parseToken).mockResolvedValue({ type: 'cache', sessionId, visitId });

    const response = await post(websiteId);

    expect(response.status).toBe(400);
    expect(saveRecording).not.toHaveBeenCalled();
  });

  test('rejects a non-cache token type', async () => {
    vi.mocked(parseToken).mockResolvedValue({ type: 'share', websiteId, sessionId, visitId });

    const response = await post(websiteId);

    expect(response.status).toBe(400);
    expect(saveRecording).not.toHaveBeenCalled();
  });

  test('accepts a cache token bound to the same website', async () => {
    vi.mocked(parseToken).mockResolvedValue({ type: 'cache', websiteId, sessionId, visitId });

    const response = await post(websiteId);

    expect(response.status).toBe(200);
    expect(saveRecording).toHaveBeenCalledWith(
      expect.objectContaining({ websiteId, sessionId, visitId }),
    );
  });
});
