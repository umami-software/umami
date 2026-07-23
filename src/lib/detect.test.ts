import { beforeEach, expect, test, vi } from 'vitest';
import { getLocation, hasBlockedIp } from './detect';
import { getIpAddress } from './ip';

const IP = '127.0.0.1';

const isLocalhost = vi.mocked(await import('is-localhost-ip'));

vi.mock('is-localhost-ip', () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();

  delete process.env.CLIENT_IP_HEADER;
  delete process.env.IGNORE_IP;
  delete process.env.SKIP_LOCATION_HEADERS;
});

test('getIpAddress: Custom header', () => {
  process.env.CLIENT_IP_HEADER = 'x-custom-ip-header';

  expect(getIpAddress(new Headers({ 'x-custom-ip-header': IP }))).toEqual(IP);
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

test('hasBlockedIp: returns false for malformed client ip with cidr block', () => {
  process.env.IGNORE_IP = '10.0.0.0/8';

  expect(hasBlockedIp('not-an-ip')).toBe(false);
});
