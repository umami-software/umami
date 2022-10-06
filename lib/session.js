import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { secret, uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import clickhouse from 'lib/clickhouse';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSessionByUuid, getWebsiteByUuid } from 'queries';

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

  const { website: website_uuid, hostname, screen, language } = payload;

  if (!validate(website_uuid)) {
    return null;
  }

  let websiteId = null;

  // Check if website exists
  if (redis.enabled) {
    websiteId = Number(await redis.get(`website:${website_uuid}`));
  }

  // Check database if does not exists in Redis
  if (!websiteId) {
    const website = await getWebsiteByUuid(website_uuid);
    websiteId = website ? website.website_id : null;
  }

  if (!websiteId || websiteId === DELETED) {
    throw new Error(`Website not found: ${website_uuid}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
  const session_uuid = uuid(websiteId, hostname, ip, userAgent);

  let sessionId = null;
  let session = null;

  if (!clickhouse.enabled) {
    // Check if session exists
    if (redis.enabled) {
      sessionId = Number(await redis.get(`session:${session_uuid}`));
    }

    // Check database if does not exists in Redis
    if (!sessionId) {
      session = await getSessionByUuid(session_uuid);
      sessionId = session ? session.session_id : null;
    }

    if (!sessionId) {
      try {
        session = await createSession(websiteId, {
          session_uuid,
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
      session_id: sessionId,
      session_uuid,
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
    website_id: websiteId,
    session,
  };
}
