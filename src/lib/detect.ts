import path from 'path';
import { getClientIp } from 'request-ip';
import { browserName, detectOS } from 'detect-browser';
import isLocalhost from 'is-localhost-ip';
import ipaddr from 'ipaddr.js';
import maxmind from 'maxmind';
import { safeDecodeURIComponent } from 'next-basics';
import {
  DESKTOP_OS,
  MOBILE_OS,
  DESKTOP_SCREEN_WIDTH,
  LAPTOP_SCREEN_WIDTH,
  MOBILE_SCREEN_WIDTH,
} from './constants';
import { NextApiRequestCollect } from 'pages/api/send';


// 1. Initialize lookup OUTSIDE any function, but make it a Promise.
let lookupPromise: any = null;

// 2. Create an initialization function.
async function initializeMaxmind() {
  if (!lookupPromise) {
    // eslint-disable-next-line no-console
    console.log('debug: loading GeoLite2-City.mmdb');
    const dir = path.join(process.cwd(), 'geo');
    const dbPath = path.resolve(dir, 'GeoLite2-City.mmdb');

    // Use try/catch for error handling during DB loading
    try {
      lookupPromise = maxmind.open(dbPath);
    } catch (error) {
      console.error("Error loading GeoLite2 database:", error);
      //  CRITICAL:  You MUST handle the error here.  Throwing an error
      //  will cause the server to crash, which is better than running
      //  without the database.
      throw error;  // Re-throw to prevent the app from starting.
    }
  }
  return lookupPromise;
}

export function getIpAddress(req: NextApiRequestCollect) {
  const customHeader = String(process.env.CLIENT_IP_HEADER).toLowerCase();

  // Custom header
  if (customHeader !== 'undefined' && req.headers[customHeader]) {
    return req.headers[customHeader];
  }
  // Cloudflare
  else if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }

  return getClientIp(req);
}

export function getDevice(screen: string, os: string) {
  if (!screen) return;

  const [width] = screen.split('x');

  if (DESKTOP_OS.includes(os)) {
    if (os === 'Chrome OS' || +width < DESKTOP_SCREEN_WIDTH) {
      return 'laptop';
    }
    return 'desktop';
  } else if (MOBILE_OS.includes(os)) {
    if (os === 'Amazon OS' || +width > MOBILE_SCREEN_WIDTH) {
      return 'tablet';
    }
    return 'mobile';
  }

  if (+width >= DESKTOP_SCREEN_WIDTH) {
    return 'desktop';
  } else if (+width >= LAPTOP_SCREEN_WIDTH) {
    return 'laptop';
  } else if (+width >= MOBILE_SCREEN_WIDTH) {
    return 'tablet';
  } else {
    return 'mobile';
  }
}

function getRegionCode(country: string, region: string) {
  if (!country || !region) {
    return undefined;
  }

  return region.includes('-') ? region : `${country}-${region}`;
}

function safeDecodeCfHeader(s: string | undefined | null): string | undefined | null {
  if (s === undefined || s === null) {
    return s;
  }

  return Buffer.from(s, 'latin1').toString('utf-8');
}

export async function getLocation(ip: string, req: NextApiRequestCollect) {
  // Ignore local ips
  if (await isLocalhost(ip)) {
    return;
  }

  // Cloudflare headers
  if (req.headers['cf-ipcountry']) {
    const country = safeDecodeCfHeader(req.headers['cf-ipcountry']);
    const subdivision1 = safeDecodeCfHeader(req.headers['cf-region-code']);
    const city = safeDecodeCfHeader(req.headers['cf-ipcity']);

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      city,
    };
  }

  // Vercel headers
  if (req.headers['x-vercel-ip-country']) {
    const country = safeDecodeURIComponent(req.headers['x-vercel-ip-country']);
    const subdivision1 = safeDecodeURIComponent(req.headers['x-vercel-ip-country-region']);
    const city = safeDecodeURIComponent(req.headers['x-vercel-ip-city']);

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      city,
    };
  }

  const lookup = await lookupPromise;
  if (!lookup) { // This check is likely unnecessary, but good for safety.
    throw new Error("Maxmind database not loaded.");
  }

  if (result) {
    const country = result.country?.iso_code ?? result?.registered_country?.iso_code;
    const subdivision1 = result.subdivisions?.[0]?.iso_code;
    const subdivision2 = result.subdivisions?.[1]?.names?.en;
    const city = result.city?.names?.en;

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      subdivision2,
      city,
    };
  }
}

export async function getClientInfo(req: NextApiRequestCollect) {
  const userAgent = req.headers['user-agent'];
  const ip = req.body?.payload?.ip || getIpAddress(req);
  const location = await getLocation(ip, req);
  const country = location?.country;
  const subdivision1 = location?.subdivision1;
  const subdivision2 = location?.subdivision2;
  const city = location?.city;
  const browser = browserName(userAgent);
  const os = detectOS(userAgent) as string;
  const device = getDevice(req.body?.payload?.screen, os);

  return { userAgent, browser, os, ip, country, subdivision1, subdivision2, city, device };
}

export function hasBlockedIp(req: NextApiRequestCollect) {
  const ignoreIps = process.env.IGNORE_IP;

  if (ignoreIps) {
    const ips = [];

    if (ignoreIps) {
      ips.push(...ignoreIps.split(',').map(n => n.trim()));
    }

    const clientIp = getIpAddress(req);

    return ips.find(ip => {
      if (ip === clientIp) return true;

      // CIDR notation
      if (ip.indexOf('/') > 0) {
        const addr = ipaddr.parse(clientIp);
        const range = ipaddr.parseCIDR(ip);

        if (addr.kind() === range[0].kind() && addr.match(range)) return true;
      }
    });
  }

  return false;
}
