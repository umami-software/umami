import path from 'path';
import requestIp from 'request-ip';
import { browserName, detectOS } from 'detect-browser';
import isLocalhost from 'is-localhost-ip';
import maxmind from 'maxmind';

import {
  DESKTOP_OS,
  MOBILE_OS,
  DESKTOP_SCREEN_WIDTH,
  LAPTOP_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
} from './constants';

let lookup;

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

export async function getCountry(req, ip) {
  // Cloudflare
  if (req.headers['cf-ipcountry']) {
    return req.headers['cf-ipcountry'];
  }

  // Ignore local ips
  if (await isLocalhost(ip)) {
    return;
  }

  // Database lookup
  if (!lookup) {
    lookup = await maxmind.open(path.resolve('./public/geo/GeoLite2-Country.mmdb'));
  }

  const result = lookup.get(ip);

  return result?.country?.iso_code;
}

export async function getClientInfo(req, { screen }) {
  const userAgent = req.headers['user-agent'];
  const ip = getIpAddress(req);
  const country = await getCountry(req, ip);
  const browser = browserName(userAgent);
  const os = detectOS(userAgent);
  const device = getDevice(screen, browser, os);

  return { userAgent, browser, os, ip, country, device };
}
