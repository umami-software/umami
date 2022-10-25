import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { secret, uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import clickhouse from 'lib/clickhouse';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSessionByUuid, getWebsite } from 'queries';

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

  const { website: websiteUuid, hostname, screen, language } = payload;

  if (!validate(websiteUuid)) {
    return null;
  }

  let websiteId = null;

  // Check if website exists
  if (redis.enabled) {
    websiteId = Number(await redis.get(`website:${websiteUuid}`));
  }

  // Check database if does not exists in Redis
  if (!websiteId) {
    const website = await getWebsite({ websiteUuid });
    websiteId = website ? website.id : null;
  }

  if (!websiteId || websiteId === DELETED) {
    throw new Error(`Website not found: ${websiteUuid}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
  const sessionUuid = uuid(websiteUuid, hostname, ip, userAgent);

  let sessionId = null;
  let session = null;

  if (!clickhouse.enabled) {
    // Check if session exists
    if (redis.enabled) {
      sessionId = Number(await redis.get(`session:${sessionUuid}`));
    }

    // Check database if does not exists in Redis
    if (!sessionId) {
      session = await getSessionByUuid(sessionUuid);
      sessionId = session ? session.id : null;
    }

    if (!sessionId) {
      try {
        session = await createSession(websiteId, {
          sessionUuid,
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
      sessionId,
      sessionUuid,
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
    website: {
      websiteId,
      websiteUuid,
    },
    session,
  };
}
