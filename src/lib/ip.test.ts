import { afterEach, describe, expect, test, vi } from 'vitest';
import { getIpAddress, stripPort } from './ip';

function headers(init: Record<string, string>) {
  return new Headers(init);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getIpAddress', () => {
  test('returns undefined when no known headers are present', () => {
    expect(getIpAddress(headers({}))).toBeUndefined();
  });

  test('extracts the first address from an x-forwarded-for chain', () => {
    expect(getIpAddress(headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' }))).toBe(
      '1.2.3.4',
    );
  });

  test('trims whitespace around the x-forwarded-for client address', () => {
    expect(getIpAddress(headers({ 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' }))).toBe('1.2.3.4');
  });

  test('reads the Cloudflare cf-connecting-ip header', () => {
    expect(getIpAddress(headers({ 'cf-connecting-ip': '203.0.113.5' }))).toBe('203.0.113.5');
  });

  test('reads the Fastly fastly-client-ip header', () => {
    expect(getIpAddress(headers({ 'fastly-client-ip': '198.51.100.7' }))).toBe('198.51.100.7');
  });

  test('reads the x-real-ip reverse proxy header', () => {
    expect(getIpAddress(headers({ 'x-real-ip': '192.0.2.9' }))).toBe('192.0.2.9');
  });

  test('parses the RFC 7239 forwarded header', () => {
    expect(getIpAddress(headers({ forwarded: 'for=192.0.2.60;proto=http;by=203.0.113.43' }))).toBe(
      '192.0.2.60',
    );
  });

  test('prefers higher-priority vendor headers over x-forwarded-for', () => {
    expect(
      getIpAddress(
        headers({
          'cf-connecting-ip': '203.0.113.5',
          'x-forwarded-for': '1.2.3.4',
        }),
      ),
    ).toBe('203.0.113.5');
  });

  test('normalizes a full IPv6 address to compressed form', () => {
    expect(getIpAddress(headers({ 'x-real-ip': '2001:0db8:0000:0000:0000:0000:0000:0001' }))).toBe(
      '2001:db8::1',
    );
  });

  test('converts an IPv4-mapped IPv6 address to IPv4', () => {
    expect(getIpAddress(headers({ 'x-real-ip': '::ffff:1.2.3.4' }))).toBe('1.2.3.4');
  });

  test('strips the port from an IPv4 address with a port', () => {
    expect(getIpAddress(headers({ 'x-real-ip': '1.2.3.4:8080' }))).toBe('1.2.3.4');
  });

  test('returns garbage input unchanged as a fallback', () => {
    expect(getIpAddress(headers({ 'x-real-ip': 'not-an-ip' }))).toBe('not-an-ip');
  });

  test('uses a custom CLIENT_IP_HEADER when configured', () => {
    vi.stubEnv('CLIENT_IP_HEADER', 'x-custom-ip');
    expect(
      getIpAddress(
        headers({
          'x-custom-ip': '10.0.0.1',
          'x-forwarded-for': '1.2.3.4',
        }),
      ),
    ).toBe('10.0.0.1');
  });

  test('falls back to standard headers when CLIENT_IP_HEADER is absent from the request', () => {
    vi.stubEnv('CLIENT_IP_HEADER', 'x-custom-ip');
    expect(getIpAddress(headers({ 'x-real-ip': '192.0.2.9' }))).toBe('192.0.2.9');
  });
});

describe('stripPort', () => {
  test('returns nullish input unchanged', () => {
    expect(stripPort(undefined)).toBeUndefined();
    expect(stripPort(null)).toBeNull();
    expect(stripPort('')).toBe('');
  });

  test('removes the port from an IPv4 address', () => {
    expect(stripPort('1.2.3.4:8080')).toBe('1.2.3.4');
  });

  test('leaves a plain IPv4 address unchanged', () => {
    expect(stripPort('1.2.3.4')).toBe('1.2.3.4');
  });

  test('keeps only the bracketed portion of a bracketed IPv6 address', () => {
    expect(stripPort('[::1]:8080')).toBe('[::1]');
  });

  test('leaves an unbracketed IPv6 address unchanged', () => {
    expect(stripPort('::1')).toBe('::1');
  });
});
