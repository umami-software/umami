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

export function hash(s) {
  return uuid(s, md5(process.env.HASH_SALT));
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

export async function parseSessionRequest(req) {
  if (req.method === 'POST') {
    const ip = getIpAddress(req);
    const { website_id, hostname, screen, language } = req.body;
    const { userAgent, browser, os } = getDevice(req);
    const country = await getCountry(req, ip);
    const session_id = hash(`${website_id}${hostname}${ip}${userAgent}${os}`);

    return {
      website_id,
      session_id,
      hostname,
      browser,
      os,
      screen,
      language,
      country,
    };
  }

  return {};
}

export function parseCollectRequest(req) {
  if (req.method === 'POST') {
    const { type, payload } = req.body;

    if (payload.session) {
      const {
        url,
        referrer,
        eventType,
        eventValue,
        session: { website_id, session_id, time, hash: validationHash },
      } = payload;

      if (
        validHash(website_id) &&
        validHash(session_id) &&
        validHash(validationHash) &&
        hash(`${website_id}${session_id}${time}`) === validationHash
      ) {
        return {
          success: 1,
          type,
          website_id,
          session_id,
          url,
          referrer,
          eventType,
          eventValue,
        };
      }
    }
  }

  return { success: 0 };
}
