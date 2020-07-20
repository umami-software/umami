import crypto from 'crypto';
import { v5 as uuid } from 'uuid';
import requestIp from 'request-ip';
import { browserName, detectOS } from 'detect-browser';
import maxmind from 'maxmind';
import geolite2 from 'geolite2-redist';
import isLocalhost from 'is-localhost-ip';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

export function hash(...args) {
  return uuid(args.join(''), md5(process.env.HASH_SALT));
}

export function validHash(s) {
  return UUID_REGEX.test(s);
}

export function getIpAddress(req) {
  // Cloudflare
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }

  return requestIp.getClientIp(req);
}

export function getDevice(req) {
  const userAgent = req.headers['user-agent'];
  const browser = browserName(userAgent);
  const os = detectOS(userAgent);

  return { userAgent, browser, os };
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
  const lookup = await geolite2.open('GeoLite2-Country', path => {
    return maxmind.open(path);
  });

  const result = lookup.get(ip);

  lookup.close();

  return result.country.iso_code;
}

export function parseSession(session) {
  const [website_id, website_uuid, session_id, session_uuid, sig] = (session || '').split(':');
  return {
    website_id: parseInt(website_id),
    website_uuid,
    session_id: parseInt(session_id),
    session_uuid,
    sig,
  };
}

export function isValidSession(session) {
  const { website_id, website_uuid, session_id, session_uuid, sig } = parseSession(session);

  return hash(website_id, website_uuid, session_id, session_uuid) === sig;
}
