import { describe, expect, test } from 'vitest';
import { createMatcher, getPathname } from './matcher';

const templates = [
  '/api/websites',
  '/api/websites/charts',
  '/api/websites/{websiteId}',
  '/api/websites/{websiteId}/replays',
  '/api/websites/{websiteId}/replays/saved',
  '/api/websites/{websiteId}/replays/{replayId}',
  '/api/websites/{websiteId}/replays/saved/{replayId}',
  '/api/websites/{websiteId}/sessions/stats',
  '/api/websites/{websiteId}/sessions/weekly',
  '/api/websites/{websiteId}/sessions/{sessionId}',
  '/api/reports',
  '/api/reports/funnel',
  '/api/reports/{reportId}',
  '/api/teams/join',
  '/api/teams/{teamId}',
  '/api/share/{slug}',
  '/api/share/id/{shareId}',
];

const match = createMatcher(templates);

describe('getPathname', () => {
  test('strips origin, query and hash', () => {
    expect(getPathname('http://localhost:3100/api/websites?page=1#x')).toBe('/api/websites');
    expect(getPathname('/api/websites?page=1')).toBe('/api/websites');
  });

  test('strips trailing slashes but keeps root', () => {
    expect(getPathname('/api/websites/')).toBe('/api/websites');
    expect(getPathname('/')).toBe('/');
  });
});

describe('createMatcher', () => {
  test('prefers literal segments over parameters', () => {
    expect(match('/api/websites/charts')).toBe('/api/websites/charts');
    expect(match('/api/websites/abc-123')).toBe('/api/websites/{websiteId}');
    expect(match('/api/reports/funnel')).toBe('/api/reports/funnel');
    expect(match('/api/reports/abc-123')).toBe('/api/reports/{reportId}');
    expect(match('/api/teams/join')).toBe('/api/teams/join');
    expect(match('/api/teams/abc-123')).toBe('/api/teams/{teamId}');
  });

  test('resolves nested literal/parameter ambiguity', () => {
    expect(match('/api/websites/w1/replays/saved')).toBe('/api/websites/{websiteId}/replays/saved');
    expect(match('/api/websites/w1/replays/r1')).toBe(
      '/api/websites/{websiteId}/replays/{replayId}',
    );
    expect(match('/api/websites/w1/replays/saved/r1')).toBe(
      '/api/websites/{websiteId}/replays/saved/{replayId}',
    );
    expect(match('/api/websites/w1/sessions/stats')).toBe(
      '/api/websites/{websiteId}/sessions/stats',
    );
    expect(match('/api/websites/w1/sessions/weekly')).toBe(
      '/api/websites/{websiteId}/sessions/weekly',
    );
    expect(match('/api/websites/w1/sessions/s1')).toBe(
      '/api/websites/{websiteId}/sessions/{sessionId}',
    );
  });

  test('distinguishes templates by segment count', () => {
    expect(match('/api/share/abcdef')).toBe('/api/share/{slug}');
    expect(match('/api/share/id/abcdef')).toBe('/api/share/id/{shareId}');
  });

  test('ignores query strings and absolute URLs', () => {
    expect(match('http://localhost:3100/api/websites/w1?startAt=1&endAt=2')).toBe(
      '/api/websites/{websiteId}',
    );
  });

  test('returns null for unknown paths', () => {
    expect(match('/api/nope')).toBeNull();
    expect(match('/api/websites/w1/unknown')).toBeNull();
  });
});
