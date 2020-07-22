import requestIp from 'request-ip';
import { browserName, detectOS } from 'detect-browser';
import maxmind from 'maxmind';
import geolite2 from 'geolite2-redist';
import isLocalhost from 'is-localhost-ip';
import { hash } from './crypto';

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
