import { beforeEach, expect, test, vi } from 'vitest';
import { getLocation, hasBlockedIp } from './detect';
import { getIpAddress } from './ip';

const IP = '127.0.0.1';

const isLocalhost = vi.mocked(await import('is-localhost-ip'));

vi.mock('is-localhost-ip', () => ({
  default: vi.fn(),
}));

const maxmind = vi.mocked((await import('maxmind')).default);

vi.mock('maxmind', () => ({
  default: { open: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();

  delete globalThis['maxmind-asn'];
  delete process.env.CLIENT_IP_HEADER;
  delete process.env.IGNORE_ASN;
  delete process.env.IGNORE_IP;
  delete process.env.SKIP_LOCATION_HEADERS;
});

test('getIpAddress: Custom header', () => {
  process.env.CLIENT_IP_HEADER = 'x-custom-ip-header';

  expect(getIpAddress(new Headers({ 'x-custom-ip-header': IP }))).toEqual(IP);
});

test('getIpAddress: Custom header set to x-forwarded-for uses leftmost IP in chain', () => {
  process.env.CLIENT_IP_HEADER = 'x-forwarded-for';

  expect(getIpAddress(new Headers({ 'x-forwarded-for': `${IP}, 10.0.0.1, 10.0.0.2` }))).toEqual(IP);
});

test('getIpAddress: CloudFlare header', () => {
  expect(getIpAddress(new Headers({ 'cf-connecting-ip': IP }))).toEqual(IP);
});

test('getIpAddress: Standard header', () => {
  expect(getIpAddress(new Headers({ 'x-forwarded-for': IP }))).toEqual(IP);
});

test('getIpAddress: No header', () => {
  expect(getIpAddress(new Headers())).toEqual(undefined);
});

test('getLocation: returns null for malformed ip', async () => {
  await expect(
    getLocation(
      'not-an-ip',
      new Headers({
        'cf-ipcountry': 'US',
        'cf-region-code': 'CA',
        'cf-ipcity': 'Los Angeles',
      }),
      false,
    ),
  ).resolves.toEqual(null);
});

test('getLocation: treats localhost check errors as non-local', async () => {
  isLocalhost.default.mockRejectedValue(new Error('DNS Lookup failed.'));

  await expect(
    getLocation(
      '8.8.8.8',
      new Headers({
        'cf-ipcountry': 'US',
        'cf-region-code': 'CA',
        'cf-ipcity': 'Los Angeles',
      }),
      false,
    ),
  ).resolves.toEqual({
    country: 'US',
    region: 'US-CA',
    city: 'Los Angeles',
  });
});

test('hasBlockedIp: returns false for malformed client ip with cidr block', async () => {
  process.env.IGNORE_IP = '10.0.0.0/8';

  await expect(hasBlockedIp('not-an-ip')).resolves.toBe(false);
});

// Headless browser fleets rotate IPs within cloud ranges but keep the same ASN,
// so blocking by ASN catches the whole fleet where IGNORE_IP ranges fall behind.
test('hasBlockedIp: blocks clients on an ignored ASN', async () => {
  process.env.IGNORE_ASN = '45102, AS132203';
  maxmind.open.mockResolvedValue({
    get: (ip: string) => ({ autonomous_system_number: ip === '43.156.0.1' ? 132203 : 15169 }),
  } as any);

  await expect(hasBlockedIp('43.156.0.1')).resolves.toBe(true);
  await expect(hasBlockedIp('8.8.8.8')).resolves.toBe(false);
});

// The ASN database is only worth its memory for installs that opted in.
test('hasBlockedIp: does not load the ASN database unless IGNORE_ASN is set', async () => {
  await expect(hasBlockedIp('43.156.0.1')).resolves.toBe(false);

  expect(maxmind.open).not.toHaveBeenCalled();
});

// A missing database must not take down collection for every visitor.
test('hasBlockedIp: allows traffic when the ASN database cannot be loaded', async () => {
  process.env.IGNORE_ASN = '132203';
  maxmind.open.mockRejectedValue(new Error('ENOENT'));
  vi.spyOn(console, 'error').mockImplementation(() => {});

  await expect(hasBlockedIp('43.156.0.1')).resolves.toBe(false);
});
