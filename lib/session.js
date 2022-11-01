import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { secret, uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import clickhouse from 'lib/clickhouse';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSession as getSessionPrisma, getWebsite } from 'queries';

export async function getSession(req) {
  const { payload } = getJsonBody(req);

  if (!payload) {
    throw new Error('Invalid request');
  }

  const cache = req.headers['x-umami-cache'];

  if (cache) {
    const result = await parseToken(cache, secret());

    if (result) {
      return result;
    }
  }

  const { website: websiteId, hostname, screen, language } = payload;

  if (!validate(websiteId)) {
    return null;
  }

  let isValidWebsite = null;

  // Check if website exists
  if (redis.enabled) {
    isValidWebsite = await redis.get(`website:${websiteId}`);
  }

  // Check database if does not exists in Redis
  if (!isValidWebsite) {
    const website = await getWebsite({ id: websiteId });
    isValidWebsite = !!website;
  }

  if (!isValidWebsite || isValidWebsite === DELETED) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
  const sessionId = uuid(websiteId, hostname, ip, userAgent);

  let isValidSession = null;
  let session = null;

  if (!clickhouse.enabled) {
    // Check if session exists
    if (redis.enabled) {
      isValidSession = await redis.get(`session:${sessionId}`);
    }

    // Check database if does not exists in Redis
    if (!isValidSession) {
      session = await getSessionPrisma({ id: sessionId });
      isValidSession = !!session;
    }

    if (!isValidSession) {
      try {
        session = await createSession(websiteId, {
          id: sessionId,
          hostname,
          browser,
          os,
          screen,
          language,
          country,
          device,
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
      hostname,
      browser,
      os,
      screen,
      language,
      country,
      device,
    };
  }

  return {
    websiteId,
    session,
  };
}
