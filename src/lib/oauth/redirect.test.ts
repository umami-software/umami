import { describe, expect, test } from 'vitest';
import {
  appendRedirectParams,
  findMatchingRedirectUri,
  isAcceptableRedirectUri,
  redirectUriMatches,
} from './redirect';

describe('redirect URIs', () => {
  test('accepts https, loopback http and custom schemes', () => {
    expect(isAcceptableRedirectUri('https://app.example/callback')).toBe(true);
    expect(isAcceptableRedirectUri('http://127.0.0.1:3000/callback')).toBe(true);
    expect(isAcceptableRedirectUri('http://localhost/callback')).toBe(true);
    expect(isAcceptableRedirectUri('myapp://callback')).toBe(true);
  });

  test('rejects non-loopback http, fragments and garbage', () => {
    expect(isAcceptableRedirectUri('http://app.example/callback')).toBe(false);
    expect(isAcceptableRedirectUri('https://app.example/callback#x')).toBe(false);
    expect(isAcceptableRedirectUri('not a url')).toBe(false);
    expect(isAcceptableRedirectUri(undefined)).toBe(false);
  });

  test('matches exactly, except loopback ports may vary', () => {
    expect(redirectUriMatches('https://a.example/cb', 'https://a.example/cb')).toBe(true);
    expect(redirectUriMatches('https://a.example/cb/', 'https://a.example/cb')).toBe(false);
    expect(redirectUriMatches('https://a.example/cb?x=1', 'https://a.example/cb')).toBe(false);
    expect(redirectUriMatches('http://127.0.0.1:51234/cb', 'http://127.0.0.1:3000/cb')).toBe(true);
    expect(redirectUriMatches('http://localhost:51234/cb', 'http://localhost/cb')).toBe(true);
    expect(redirectUriMatches('http://127.0.0.1:51234/other', 'http://127.0.0.1:3000/cb')).toBe(
      false,
    );
    expect(redirectUriMatches('http://localhost:1/cb', 'http://127.0.0.1:1/cb')).toBe(false);
  });

  test('finds the registered match', () => {
    expect(
      findMatchingRedirectUri('http://127.0.0.1:9999/cb', [
        'https://a.example/cb',
        'http://127.0.0.1:1/cb',
      ]),
    ).toBe('http://127.0.0.1:1/cb');
    expect(findMatchingRedirectUri('https://evil.example/cb', ['https://a.example/cb'])).toBeNull();
  });

  test('appends parameters without dropping existing ones', () => {
    const url = new URL(
      appendRedirectParams('https://a.example/cb?keep=1', {
        code: 'c',
        state: undefined,
        iss: 'i',
      }),
    );

    expect(url.searchParams.get('keep')).toBe('1');
    expect(url.searchParams.get('code')).toBe('c');
    expect(url.searchParams.get('iss')).toBe('i');
    expect(url.searchParams.has('state')).toBe(false);
  });
});
