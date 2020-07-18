import crypto from 'crypto';
import { v5 as uuid } from 'uuid';
import requestIp from 'request-ip';
import { browserName, detectOS } from 'detect-browser';

export function md5(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

export function hash(s) {
  return uuid(s, md5(process.env.HASH_SALT));
}

export function validHash(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s);
}

export function getIpAddress(req) {
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

export function getCountry(req) {
  return req.headers['cf-ipcountry'];
}

export function parseSessionRequest(req) {
  const ip = getIpAddress(req);
  const { website_id, screen, language } = JSON.parse(req.body);
  const { userAgent, browser, os } = getDevice(req);
  const country = getCountry(req);
  const session_id = hash(`${website_id}${ip}${userAgent}${os}`);

  return {
    website_id,
    session_id,
    browser,
    os,
    screen,
    language,
    country,
  };
}

export function parseCollectRequest(req) {
  const { type, payload } = JSON.parse(req.body);

  if (payload.session) {
    const {
      url,
      referrer,
      session: { website_id, session_id, time, hash: validationHash },
    } = payload;

    if (
      validHash(website_id) &&
      validHash(session_id) &&
      validHash(validationHash) &&
      hash(`${website_id}${session_id}${time}`) === validationHash
    ) {
      return {
        valid: true,
        type,
        session_id,
        url,
        referrer,
      };
    }
  }

  return { valid: false };
}
