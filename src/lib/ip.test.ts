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

  test('uses the leftmost address of a multi-element forwarded header', () => {
    expect(getIpAddress(headers({ forwarded: 'for=192.0.2.43, for=198.51.100.17' }))).toBe(
      '192.0.2.43',
    );
  });

  test('parses quoted, bracketed IPv6 with a port in the forwarded header', () => {
    expect(getIpAddress(headers({ forwarded: 'for="[2001:db8:cafe::17]:4711";proto=https' }))).toBe(
      '2001:db8:cafe::17',
    );
  });

  test('parses bracketed IPv6 without a port', () => {
    expect(getIpAddress(headers({ forwarded: 'For="[::1]"' }))).toBe('::1');
    expect(getIpAddress(headers({ 'x-real-ip': '[2001:db8::1]:8080' }))).toBe('2001:db8::1');
  });

  test('skips unknown and obfuscated forwarded nodes without TRUSTED_PROXIES', () => {
    expect(getIpAddress(headers({ forwarded: 'for=unknown, for=_hidden, for=192.0.2.43' }))).toBe(
      '192.0.2.43',
    );
  });

  test('ignores empty x-forwarded-for entries', () => {
    expect(getIpAddress(headers({ 'x-forwarded-for': ', 1.2.3.4' }))).toBe('1.2.3.4');
  });
});

describe('getIpAddress with TRUSTED_PROXIES', () => {
  test('keeps existing behavior when TRUSTED_PROXIES is not set', () => {
    expect(
      getIpAddress(
        headers({
          'x-real-ip': '10.0.0.8',
          'x-forwarded-for': '203.0.113.5, 10.0.0.8',
        }),
      ),
    ).toBe('10.0.0.8');
  });

  test('skips a header that holds a trusted proxy address', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(
      getIpAddress(
        headers({
          'x-real-ip': '10.0.0.8',
          'x-forwarded-for': '203.0.113.5, 10.0.0.8',
        }),
      ),
    ).toBe('203.0.113.5');
  });

  test('walks x-forwarded-for right to left past trusted proxies', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8, 172.16.0.0/12');
    expect(
      getIpAddress(
        headers({ 'x-forwarded-for': '192.168.1.5, 203.0.113.5, 172.16.0.2, 10.0.0.8' }),
      ),
    ).toBe('203.0.113.5');
  });

  test('ignores a spoofed leftmost x-forwarded-for entry', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.8');
    expect(getIpAddress(headers({ 'x-forwarded-for': '6.6.6.6, 192.168.1.5, 10.0.0.8' }))).toBe(
      '192.168.1.5',
    );
  });

  test('keeps private client addresses that are not trusted proxies', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.8');
    expect(
      getIpAddress(
        headers({
          'x-real-ip': '100.101.102.103',
          'x-forwarded-for': '203.0.113.5, 10.0.0.8',
        }),
      ),
    ).toBe('100.101.102.103');
  });

  test('walks the forwarded header right to left', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8, fd00::/8');
    expect(
      getIpAddress(
        headers({
          forwarded: 'for=6.6.6.6, for="[2001:db8::17]:4711", for="[fd00::1]", for=10.0.0.8',
        }),
      ),
    ).toBe('2001:db8::17');
  });

  test('stops at an unknown forwarded hop instead of trusting entries left of it', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(getIpAddress(headers({ forwarded: 'for=6.6.6.6, for=_hidden, for=10.0.0.8' }))).toBe(
      null,
    );
  });

  test('returns the leftmost address when every hop is trusted', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(getIpAddress(headers({ 'x-forwarded-for': '10.0.0.2, 10.0.0.8' }))).toBe('10.0.0.2');
  });

  test('falls back to the first trusted address when no header has a client address', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(
      getIpAddress(headers({ 'x-real-ip': '10.0.0.8', 'x-forwarded-for': '10.0.0.2, 10.0.0.8' })),
    ).toBe('10.0.0.8');
  });

  test('matches IPv4-mapped IPv6 addresses against IPv4 ranges', () => {
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(getIpAddress(headers({ 'x-forwarded-for': '203.0.113.5, ::ffff:10.0.0.8' }))).toBe(
      '203.0.113.5',
    );
  });

  test('applies to CLIENT_IP_HEADER chains', () => {
    vi.stubEnv('CLIENT_IP_HEADER', 'x-forwarded-for');
    vi.stubEnv('TRUSTED_PROXIES', '10.0.0.0/8');
    expect(getIpAddress(headers({ 'x-forwarded-for': '6.6.6.6, 203.0.113.5, 10.0.0.8' }))).toBe(
      '203.0.113.5',
    );
  });

  test('supports the private, loopback and linklocal presets', () => {
    vi.stubEnv('TRUSTED_PROXIES', 'Private, loopback, linklocal');
    expect(
      getIpAddress(
        headers({
          'x-forwarded-for':
            '6.6.6.6, 203.0.113.5, 10.0.0.1, 172.16.0.1, 192.168.0.1, fd00::1, 127.0.0.1, ::1, 169.254.0.1',
        }),
      ),
    ).toBe('203.0.113.5');
  });

  test('private preset does not include CGNAT (e.g. Tailscale) addresses', () => {
    vi.stubEnv('TRUSTED_PROXIES', 'private');
    expect(
      getIpAddress(headers({ 'x-forwarded-for': '203.0.113.5, 100.101.102.103, 10.0.0.8' })),
    ).toBe('100.101.102.103');
  });

  test('ignores invalid TRUSTED_PROXIES entries', () => {
    vi.stubEnv('TRUSTED_PROXIES', 'garbage, 10.0.0.8, 1.2.3.4/99');
    expect(getIpAddress(headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.8' }))).toBe(
      '203.0.113.5',
    );
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
