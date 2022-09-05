import { parseToken } from 'next-basics';
import { validate } from 'uuid';
import { uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import { getClientInfo, getJsonBody } from 'lib/request';
import { createSession, getSessionByUuid, getWebsiteByUuid } from 'queries';

export async function getSession(req) {
  const { payload } = getJsonBody(req);

  if (!payload) {
    throw new Error('Invalid request');
  }

  const cache = req.headers['x-umami-cache'];

  if (cache) {
    const result = await parseToken(cache);

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
  if (redis.client) {
    websiteId = await redis.client.get(`website:${website_uuid}`);
  }

  // Check database if redis does not have
  if (!websiteId) {
    const website = await getWebsiteByUuid(website_uuid);
    websiteId = website ? website.website_id : null;
  }

  if (!websiteId || websiteId === DELETED) {
    throw new Error(`Website not found: ${website_uuid}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);

  const session_uuid = uuid(websiteId, hostname, ip, userAgent);

  let sessionCreated = false;
  let sessionId = null;
  let session = null;

  // Check if session exists
  if (redis.client) {
    sessionCreated = !!(await redis.client.get(`session:${session_uuid}`));
  }

  // Check database if redis does not have
  if (!sessionCreated) {
    session = await getSessionByUuid(session_uuid);
    sessionCreated = !!session;
    sessionId = session ? session.session_id : null;
  }

  if (!sessionCreated) {
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

      sessionId = session ? session.session_id : null;
    } catch (e) {
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
  }

  return {
    website_id: websiteId,
    session_id: sessionId,
    session_uuid,
  };
}
