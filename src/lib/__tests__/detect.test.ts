import * as detect from '../detect';
import { expect } from '@jest/globals';

const IP = '127.0.0.1';
const BAD_IP = '127.127.127.127';

test('getIpAddress: Custom header', () => {
  process.env.CLIENT_IP_HEADER = 'x-custom-ip-header';

  expect(detect.getIpAddress(new Headers({ 'x-custom-ip-header': IP }))).toEqual(IP);
});

test('getIpAddress: CloudFlare header', () => {
  expect(detect.getIpAddress(new Headers({ 'cf-connecting-ip': IP }))).toEqual(IP);
});

test('getIpAddress: Standard header', () => {
  expect(detect.getIpAddress(new Headers({ 'x-forwarded-for': IP }))).toEqual(IP);
});

test('getIpAddress: CloudFlare header is lower priority than standard header', () => {
  expect(
    detect.getIpAddress(new Headers({ 'cf-connecting-ip': BAD_IP, 'x-forwarded-for': IP })),
  ).toEqual(IP);
});

test('getIpAddress: No header', () => {
  expect(detect.getIpAddress(new Headers())).toEqual(null);
});
