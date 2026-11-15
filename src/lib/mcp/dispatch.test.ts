import { describe, expect, test } from 'vitest';
import { matchDispatchRoute } from './dispatch';

describe('MCP dispatch table', () => {
  test('matches concrete paths and extracts parameters', () => {
    const match = matchDispatchRoute('GET', '/api/websites/abc/sessions/def/activity');

    expect(match?.route.path).toBe('/api/websites/{websiteId}/sessions/{sessionId}/activity');
    expect(match?.params).toEqual({ websiteId: 'abc', sessionId: 'def' });
  });

  test('ignores a base path prefix and rejects unknown routes', () => {
    expect(matchDispatchRoute('GET', '/umami/api/websites')?.route.path).toBe('/api/websites');
    expect(matchDispatchRoute('POST', '/api/websites')).toBeNull();
    expect(matchDispatchRoute('GET', '/api/admin/users')).toBeNull();
    expect(matchDispatchRoute('DELETE', '/api/websites/abc')).toBeNull();
  });

  test('exposes saved definitions and performance as GET only', () => {
    expect(matchDispatchRoute('GET', '/api/websites/abc/funnels/def/stats')?.params).toEqual({
      websiteId: 'abc',
      funnelId: 'def',
    });
    expect(matchDispatchRoute('GET', '/api/websites/abc/goals/def/stats')?.params).toEqual({
      websiteId: 'abc',
      goalId: 'def',
    });

    for (const path of ['goals', 'funnels', 'segments', 'annotations', 'performance/stats']) {
      expect(matchDispatchRoute('GET', `/api/websites/abc/${path}`)).not.toBeNull();
      expect(matchDispatchRoute('POST', `/api/websites/abc/${path}`)).toBeNull();
    }

    expect(matchDispatchRoute('GET', '/api/websites/abc/goals/def')).toBeNull();
    expect(matchDispatchRoute('DELETE', '/api/websites/abc/segments/def')).toBeNull();
  });
});
