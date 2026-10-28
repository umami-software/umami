import { describe, expect, test } from 'vitest';
import { getEmbedFrameAncestors, normalizeEmbedOrigins, sanitizeShareParameters } from './share';

describe('normalizeEmbedOrigins', () => {
  test('keeps exact origins, drops paths, dupes, wildcards, credentials and non-web schemes', () => {
    expect(
      normalizeEmbedOrigins(
        'https://a.com/path http://localhost:3000 https://a.com https://*.evil.com javascript:alert(1) https://u:p@x.com',
      ),
    ).toEqual(['https://a.com', 'http://localhost:3000']);
  });

  test('accepts arrays and ignores junk', () => {
    expect(normalizeEmbedOrigins(['https://b.com', 5, '', 'nope'])).toEqual(['https://b.com']);
    expect(normalizeEmbedOrigins(undefined)).toEqual([]);
  });
});

describe('sanitizeShareParameters', () => {
  test('strips embed fields unless embed is true', () => {
    expect(sanitizeShareParameters({ embed: false, embedOrigins: ['https://a.com'] })).toEqual({});
    expect(sanitizeShareParameters({ embed: true, embedOrigins: 'https://a.com/x' })).toEqual({
      embed: true,
      embedOrigins: ['https://a.com'],
    });
  });
});

describe('getEmbedFrameAncestors', () => {
  test('is none when embedding is disabled', () => {
    expect(getEmbedFrameAncestors({})).toBe("'none'");
  });

  test('is self plus approved origins when enabled; empty list = self only', () => {
    expect(getEmbedFrameAncestors({ embed: true, embedOrigins: ['https://a.com'] })).toBe(
      "'self' https://a.com",
    );
    expect(getEmbedFrameAncestors({ embed: true, embedOrigins: [] })).toBe("'self'");
  });
});
