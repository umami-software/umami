import { beforeEach, expect, test } from 'vitest';
import { getDevice, getLocation, hasBlockedIp } from './detect';
import { getIpAddress } from './ip';

const IP = '127.0.0.1';

const LOCATION_HEADERS = {
  'cf-ipcountry': 'US',
  'cf-region-code': 'CA',
  'cf-ipcity': 'Los Angeles',
};

beforeEach(() => {
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

test.each([
  '127.0.0.1',
  '127.1',
  '2130706433',
  '10.1.2.3',
  '172.16.0.1',
  '192.168.1.1',
  '169.254.0.1',
  '0.0.0.0',
  '::',
  '::1',
  'fe80::1',
  'fd00::1',
  'fd12:3456::abcd',
  'fe80::1234:5678',
  '::ffff:a00:1',
])('getLocation: returns null for local ip %s', async ip => {
  await expect(getLocation(ip, new Headers(LOCATION_HEADERS), false)).resolves.toEqual(null);
});

test.each(['8.8.8.8', '100.64.0.1', '172.32.0.1', '2001:4860::8888', '::ffff:808:808'])(
  'getLocation: uses location headers for public ip %s',
  async ip => {
    await expect(getLocation(ip, new Headers(LOCATION_HEADERS), false)).resolves.toEqual({
      country: 'US',
      region: 'US-CA',
      city: 'Los Angeles',
    });
  },
);

const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

test.each([
  { userAgent: CHROME_WINDOWS, screen: '2560x1440', device: 'desktop' },
  { userAgent: CHROME_WINDOWS, screen: '1920x1080', device: 'laptop' },
  {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    screen: '390x844',
    device: 'mobile',
  },
  {
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
    screen: '820x1180',
    device: 'tablet',
  },
  {
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    screen: '412x915',
    device: 'mobile',
  },
])('getDevice: $device at $screen', ({ userAgent, screen, device }) => {
  expect(getDevice(userAgent, screen)).toEqual(device);
});

test('hasBlockedIp: returns false for malformed client ip with cidr block', () => {
  process.env.IGNORE_IP = '10.0.0.0/8';

  expect(hasBlockedIp('not-an-ip')).toBe(false);
});
