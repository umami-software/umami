import path from 'path';
import debug from 'debug';
import { browserName, detectOS } from 'detect-browser';
import ipaddr from 'ipaddr.js';
import isLocalhost from 'is-localhost-ip';
import maxmind from 'maxmind';
import { safeDecodeURIComponent } from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/send';
import { getClientIp } from 'request-ip';
import {
  DESKTOP_OS,
  DESKTOP_SCREEN_WIDTH,
  LAPTOP_SCREEN_WIDTH,
  MOBILE_OS,
  MOBILE_SCREEN_WIDTH,
} from './constants';

const log = debug('umami:detect');

let lookup;

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

export async function getLocation(ip: string, req: NextApiRequestCollect) {
  // Ignore local ips
  if (await isLocalhost(ip)) {
    log('Localhost:', ip);
    return;
  }
  const envHeaders = {
    country: process.env.X_UMAMI_IP_COUNTRY?.toLowerCase(),
    region: process.env.X_UMAMI_IP_COUNTRY_REGION?.toLowerCase(),
    city: process.env.X_UMAMI_IP_CITY?.toLowerCase(),
    lat: process.env.X_UMAMI_IP_LATITUDE?.toLowerCase(),
    lng: process.env.X_UMAMI_IP_LONGITUDE?.toLowerCase(),
  };

  const hasCustomHeaders =
    envHeaders.country &&
    envHeaders.region &&
    envHeaders.city &&
    envHeaders.lat &&
    envHeaders.lng &&
    req.headers[envHeaders.country] &&
    req.headers[envHeaders.region] &&
    req.headers[envHeaders.city] &&
    req.headers[envHeaders.lat] &&
    req.headers[envHeaders.lng];

  if (hasCustomHeaders) {
    log('Use custom headers');

    const country = safeDecodeURIComponent(req.headers[envHeaders.country]);
    const subdivision1Raw = safeDecodeURIComponent(req.headers[envHeaders.region]);
    const city = safeDecodeURIComponent(req.headers[envHeaders.city]);
    const lat = parseFloat(safeDecodeURIComponent(req.headers[envHeaders.lat]));
    const lng = parseFloat(safeDecodeURIComponent(req.headers[envHeaders.lng]));

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1Raw),
      city,
      lat,
      lng,
    };
  }

  // Cloudflare headers
  if (req.headers['cf-ipcountry']) {
    log('Use Cloudflare headers');

    const country = safeDecodeURIComponent(req.headers['cf-ipcountry']);
    const subdivision1 = safeDecodeURIComponent(req.headers['cf-region-code']);
    const city = safeDecodeURIComponent(req.headers['cf-ipcity']);
    const lat = safeDecodeURIComponent(req.headers['cf-iplatitude']);
    const lng = safeDecodeURIComponent(req.headers['cf-iplongitude']);

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      city,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
  }

  // Vercel headers
  if (req.headers['x-vercel-ip-country']) {
    log('Use Vercel headers');

    const country = safeDecodeURIComponent(req.headers['x-vercel-ip-country']);
    const subdivision1 = safeDecodeURIComponent(req.headers['x-vercel-ip-country-region']);
    const city = safeDecodeURIComponent(req.headers['x-vercel-ip-city']);
    const lat = safeDecodeURIComponent(req.headers['x-vercel-ip-latitude']);
    const lng = safeDecodeURIComponent(req.headers['x-vercel-ip-longitude']);

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      city,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };
  }

  // Database lookup
  if (!lookup) {
    const dir = path.join(process.cwd(), 'geo');

    lookup = await maxmind.open(path.resolve(dir, 'GeoLite2-City.mmdb'));
  }

  const result = lookup.get(ip);

  if (result) {
    const country = result.country?.iso_code ?? result?.registered_country?.iso_code;
    const subdivision1 = result.subdivisions?.[0]?.iso_code;
    const subdivision2 = result.subdivisions?.[1]?.names?.en;
    const city = result.city?.names?.en;
    const lat = result.location?.latitude;
    const lng = result.location?.longitude;

    return {
      country,
      subdivision1: getRegionCode(country, subdivision1),
      subdivision2,
      city,
      lat,
      lng,
    };
  }

  log('Location not found:', ip);
}

export async function getClientInfo(req: NextApiRequestCollect) {
  const userAgent = req.headers['user-agent'];
  const ip = req.body?.payload?.ip || getIpAddress(req);
  const location = await getLocation(ip, req);
  const country = location?.country;
  const subdivision1 = location?.subdivision1;
  const subdivision2 = location?.subdivision2;
  const city = location?.city;
  const lat = location?.lat;
  const lng = location?.lng;
  const browser = browserName(userAgent);
  const os = detectOS(userAgent) as string;
  const device = getDevice(req.body?.payload?.screen, os);

  return {
    userAgent,
    browser,
    os,
    ip,
    country,
    subdivision1,
    subdivision2,
    city,
    device,
    lat,
    lng,
  };
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
