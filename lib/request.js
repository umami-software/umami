import requestIp from 'request-ip';
import { browserName, detectOS } from 'detect-browser';
import isLocalhost from 'is-localhost-ip';
import { WebServiceClient } from '@maxmind/geoip2-node';
const client = new WebServiceClient(process.env.MAXMIND_ID, process.env.MAXMIND_KEY);

import {
  DESKTOP_OS,
  MOBILE_OS,
  DESKTOP_SCREEN_WIDTH,
  LAPTOP_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
} from './constants';

export function getIpAddress(req) {
  // Cloudflare
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }

  return requestIp.getClientIp(req);
}

export function getDevice(screen, browser, os) {
  if (!screen) return;

  const [width] = screen.split('x');

  if (DESKTOP_OS.includes(os)) {
    if (os === 'Chrome OS' || width < DESKTOP_SCREEN_WIDTH) {
      return 'laptop';
    }
    return 'desktop';
  } else if (MOBILE_OS.includes(os)) {
    if (os === 'Amazon OS' || width > MOBILE_SCREEN_WIDTH) {
      return 'tablet';
    }
    return 'mobile';
  }

  if (width >= DESKTOP_SCREEN_WIDTH) {
    return 'desktop';
  } else if (width >= LAPTOP_SCREEN_WIDTH) {
    return 'laptop';
  } else if (width >= MOBILE_SCREEN_WIDTH) {
    return 'tablet';
  } else {
    return 'mobile';
  }
}

export async function getLocation(req, ip) {
  // Cloudflare
  if (req.headers['cf-ipcountry']) {
    return req.headers['cf-ipcountry'];
  }

  // Ignore local ips
  if (await isLocalhost(ip)) {
    return;
  }

  const result = await client.city(ip);

  return {
    country: result?.country.isoCode,
    region: result?.subdivisions?.[0]?.names?.en,
    city: result?.city?.names?.en,
  };
}

export async function getClientInfo(req, { screen }) {
  const userAgent = req.headers['user-agent'];
  const ip = getIpAddress(req);
  const { country, region, city } = await getLocation(req, ip);
  const browser = browserName(userAgent);
  const os = detectOS(userAgent);
  const device = getDevice(screen, browser, os);

  return { userAgent, browser, os, ip, country, device, region, city };
}
