import { describe, expect, test } from 'vitest';
import {
  buildPath,
  getQueryString,
  isValidLinkUrl,
  isValidUrl,
  safeDecodeURI,
  safeDecodeURIComponent,
} from './url';

describe('getQueryString', () => {
  test('returns an empty string for no params', () => {
    expect(getQueryString()).toBe('');
    expect(getQueryString({})).toBe('');
  });

  test('serializes params into a query string', () => {
    expect(getQueryString({ a: 1, b: 'two' })).toBe('a=1&b=two');
  });

  test('skips undefined, null and NaN values', () => {
    expect(getQueryString({ a: 1, b: undefined, c: null, d: NaN })).toBe('a=1');
  });

  test('encodes special characters', () => {
    expect(getQueryString({ q: 'a b&c' })).toBe('q=a+b%26c');
  });
});

describe('buildPath', () => {
  test('appends a query string when params are present', () => {
    expect(buildPath('/api', { a: 1 })).toBe('/api?a=1');
  });

  test('returns the path unchanged when there are no params', () => {
    expect(buildPath('/api')).toBe('/api');
    expect(buildPath('/api', {})).toBe('/api');
  });
});

describe('safeDecodeURI', () => {
  test('decodes a valid encoded URI', () => {
    expect(safeDecodeURI('a%20b')).toBe('a b');
  });

  test('returns the original string for malformed input', () => {
    expect(safeDecodeURI('%')).toBe('%');
    expect(safeDecodeURI('%E0%A4%A')).toBe('%E0%A4%A');
  });

  test('passes through null and undefined', () => {
    expect(safeDecodeURI(null)).toBeNull();
    expect(safeDecodeURI(undefined)).toBeUndefined();
  });
});

describe('safeDecodeURIComponent', () => {
  test('decodes a valid encoded component', () => {
    expect(safeDecodeURIComponent('a%26b')).toBe('a&b');
  });

  test('returns the original string for malformed input', () => {
    expect(safeDecodeURIComponent('%')).toBe('%');
    expect(safeDecodeURIComponent('%ZZ')).toBe('%ZZ');
  });

  test('passes through null and undefined', () => {
    expect(safeDecodeURIComponent(null)).toBeNull();
    expect(safeDecodeURIComponent(undefined)).toBeUndefined();
  });
});

describe('isValidUrl', () => {
  test('returns true for valid urls', () => {
    expect(isValidUrl('https://umami.is')).toBe(true);
    expect(isValidUrl('http://localhost:3000/path?q=1')).toBe(true);
  });

  test('returns false for invalid urls', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('/relative/path')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidLinkUrl', () => {
  // Links send visitors to mail clients and apps too, so only schemes that are never a
  // destination are refused.
  test('accepts web, mail and app destinations', () => {
    expect(isValidLinkUrl('https://umami.is/docs?ref=1')).toBe(true);
    expect(isValidLinkUrl('http://localhost:3000/path')).toBe(true);
    expect(isValidLinkUrl('mailto:hi@example.com')).toBe(true);
    expect(isValidLinkUrl('myapp://open')).toBe(true);
  });

  test('refuses urls that do not parse', () => {
    expect(isValidLinkUrl('not a url')).toBe(false);
    expect(isValidLinkUrl('/relative/path')).toBe(false);
    expect(isValidLinkUrl('')).toBe(false);
  });

  // A saved link is clicked by teammates in the links table and followed by everyone who opens
  // the short url, so it must never run script or load content from the visitor's machine.
  test('refuses script, inline and local schemes in any spelling', () => {
    expect(isValidLinkUrl('javascript:alert(1)')).toBe(false);
    expect(isValidLinkUrl('JavaScript:alert(1)')).toBe(false);
    expect(isValidLinkUrl('java\tscript:alert(1)')).toBe(false);
    expect(isValidLinkUrl('data:text/html,<h1>Sign in</h1>')).toBe(false);
    expect(isValidLinkUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isValidLinkUrl('file:///etc/passwd')).toBe(false);
    expect(isValidLinkUrl('blob:https://umami.is/1234')).toBe(false);
  });

  // Phishing links put a trusted name before the @ so the url reads as that site.
  test('refuses urls carrying a username or password', () => {
    expect(isValidLinkUrl('https://bank.com@evil.example/login')).toBe(false);
    expect(isValidLinkUrl('https://user:pass@example.com')).toBe(false);
    expect(isValidLinkUrl('https://:pass@example.com')).toBe(false);
  });

  // Cloud links are public and a bare IP hides who runs the destination; a self-hosted install
  // may link to machines on its own network.
  test('refuses ip address hosts in cloud mode only', () => {
    const ipUrls = [
      'http://203.0.113.7/login',
      'http://0xcb.0.113.7/', // hex, normalized by the parser
      'http://3405803783/', // the same address as one integer
      'http://[2001:db8::1]/',
    ];

    for (const url of ipUrls) {
      expect(isValidLinkUrl(url, true)).toBe(false);
      expect(isValidLinkUrl(url, false)).toBe(true);
    }

    expect(isValidLinkUrl('https://203-0-113-7.example.com', true)).toBe(true);
  });
});
