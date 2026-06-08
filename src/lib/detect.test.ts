import { expect, test } from 'vitest';
import { getIpAddress } from './ip';

const IP = '127.0.0.1';

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

test('getIpAddress: skips private/internal IP for the public client IP', () => {
  delete process.env.CLIENT_IP_HEADER;

  expect(
    getIpAddress(
      new Headers({
        'x-real-ip': '10.0.0.8',
        'x-forwarded-for': '79.127.237.104, 10.0.0.8',
      }),
    ),
  ).toEqual('79.127.237.104');
});

test('getIpAddress: custom x-forwarded-for header extracts the first IP', () => {
  process.env.CLIENT_IP_HEADER = 'x-forwarded-for';

  expect(getIpAddress(new Headers({ 'x-forwarded-for': '79.127.237.104, 10.0.0.8' }))).toEqual(
    '79.127.237.104',
  );

  delete process.env.CLIENT_IP_HEADER;
});
