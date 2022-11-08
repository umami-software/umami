import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { secret, uuid } from 'lib/crypto';
import cache from 'lib/cache';
import clickhouse from 'lib/clickhouse';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSession, getWebsite } from 'queries';

export async function findSession(req) {
  const { payload } = getJsonBody(req);

  if (!payload) {
    return null;
  }

  // Check if cache token is passed
  const cacheToken = req.headers['x-umami-cache'];

  if (cacheToken) {
    const result = await parseToken(cacheToken, secret());

    if (result) {
      return result;
    }
  }

  // Verify payload
  const { website: websiteId, hostname, screen, language } = payload;

  if (!validate(websiteId)) {
    return null;
  }

  // Find website
  let website;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsite({ id: websiteId });
  }

  if (!website || website.isDeleted) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
  const sessionId = uuid(websiteId, hostname, ip, userAgent);

  // Find session
  let session;

  if (!clickhouse.enabled) {
    if (cache.enabled) {
      session = await cache.fetchSession(sessionId);
    } else {
      session = await getSession({ id: sessionId });
    }

    // Create a session if not found
    if (!session) {
      try {
        session = await createSession({
          id: sessionId,
          websiteId,
          hostname,
          browser,
          os,
          device,
          screen,
          language,
          country,
        });
      } catch (e) {
        if (!e.message.toLowerCase().includes('unique constraint')) {
          throw e;
        }
      }
    }
  } else {
    session = {
      id: sessionId,
      websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
    };
  }

  return session;
}
