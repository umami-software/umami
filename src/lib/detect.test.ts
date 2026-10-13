import { beforeEach, expect, test, vi } from 'vitest';
import { getClientInfo, getLocation, hasBlockedIp } from './detect';
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

test('hasBlockedIp: returns false for malformed client ip with cidr block', () => {
  process.env.IGNORE_IP = '10.0.0.0/8';

  expect(hasBlockedIp('not-an-ip')).toBe(false);
});

test('getClientInfo: payload location overrides geo lookup', async () => {
  const request = new Request('http://localhost/api/send', {
    headers: { 'cf-connecting-ip': '8.8.8.8', 'cf-ipcountry': 'US', 'cf-ipcity': 'Los Angeles' },
  });

  await expect(
    getClientInfo(request, { country: 'DE', region: 'BE', city: 'Berlin' }),
  ).resolves.toMatchObject({ country: 'DE', region: 'DE-BE', city: 'Berlin' });
});

test('getClientInfo: payload country without region or city leaves them empty', async () => {
  const request = new Request('http://localhost/api/send', {
    headers: {
      'cf-connecting-ip': '8.8.8.8',
      'cf-ipcountry': 'US',
      'cf-region-code': 'CA',
      'cf-ipcity': 'Los Angeles',
    },
  });

  const info = await getClientInfo(request, { country: 'DE' });

  expect(info.country).toBe('DE');
  expect(info.region).toBeUndefined();
  expect(info.city).toBeUndefined();
});

test('getClientInfo: payload region without city leaves city empty', async () => {
  const request = new Request('http://localhost/api/send', {
    headers: { 'cf-connecting-ip': '8.8.8.8', 'cf-ipcountry': 'US', 'cf-ipcity': 'Los Angeles' },
  });

  const info = await getClientInfo(request, { country: 'DE', region: 'DE-BE' });

  expect(info).toMatchObject({ country: 'DE', region: 'DE-BE' });
  expect(info.city).toBeUndefined();
});

test('getClientInfo: uses geo lookup when no payload country is sent', async () => {
  const request = new Request('http://localhost/api/send', {
    headers: { 'cf-connecting-ip': '8.8.8.8', 'cf-ipcountry': 'US', 'cf-ipcity': 'Los Angeles' },
  });

  await expect(getClientInfo(request, {})).resolves.toMatchObject({
    country: 'US',
    city: 'Los Angeles',
  });
});
