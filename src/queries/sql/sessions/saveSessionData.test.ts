import { beforeEach, describe, expect, test, vi } from 'vitest';
import { DATA_TYPE } from '@/lib/constants';
import { relationalQuery } from './saveSessionData';

const { writeRawQueryMock } = vi.hoisted(() => ({
  writeRawQueryMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    writeRawQuery: writeRawQueryMock,
  },
}));

describe('relationalQuery', () => {
  beforeEach(() => {
    writeRawQueryMock.mockReset();
    writeRawQueryMock.mockResolvedValue(undefined);
  });

  test('writes session data with a Postgres upsert keyed by sessionId and dataKey', async () => {
    const createdAt = new Date('2026-07-30T10:00:00.000Z');

    await relationalQuery({
      websiteId: 'website-1',
      sessionId: 'session-1',
      sessionData: { plan: 'pro' },
      distinctId: 'distinct-1',
      createdAt,
    });

    expect(writeRawQueryMock).toHaveBeenCalledTimes(1);

    const [query, params, tag] = writeRawQueryMock.mock.calls[0];

    expect(query).toContain('insert into session_data');
    expect(query).toContain('on conflict (session_id, data_key)');
    expect(query).toContain('do update set');
    expect(query).toContain('coalesce({{createdAt}}, now())');
    expect(query).toContain('created_at = coalesce({{createdAt}}, session_data.created_at)');
    expect(query).toContain('{{id}}');
    expect(query).toContain('{{websiteId}}');
    expect(query).toContain('{{sessionId}}');
    expect(query).toContain('{{dataKey}}');
    expect(params).toEqual({
      id: expect.any(String),
      websiteId: 'website-1',
      sessionId: 'session-1',
      dataKey: 'plan',
      stringValue: 'pro',
      numberValue: null,
      dateValue: null,
      dataType: DATA_TYPE.string,
      distinctId: 'distinct-1',
      createdAt,
    });
    expect(tag).toBe('saveSessionData');
  });

  test('preserves default and existing createdAt behavior when createdAt is omitted', async () => {
    await relationalQuery({
      websiteId: 'website-1',
      sessionId: 'session-1',
      sessionData: { plan: 'pro' },
      distinctId: 'distinct-1',
    });

    const [query, params] = writeRawQueryMock.mock.calls[0];

    expect(query).toContain('coalesce({{createdAt}}, now())');
    expect(query).toContain('created_at = coalesce({{createdAt}}, session_data.created_at)');
    expect(params.createdAt).toBeUndefined();
  });
});
