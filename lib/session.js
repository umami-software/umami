import { isValidUuid, parseToken, uuid } from 'lib/crypto';
import redis from 'lib/redis';
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

  if (!isValidUuid(website_uuid)) {
    throw new Error(`Invalid website: ${website_uuid}`);
  }

  let websiteId = null;

  // Check if website exists
  if (process.env.REDIS_URL) {
    websiteId = await redis.get(`website:${website_uuid}`);
  } else {
    const { website_id } = await getWebsiteByUuid(website_uuid);
    websiteId = website_id;
  }

  if (!websiteId) {
    throw new Error(`Website not found: ${website_uuid}`);
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);

  const session_uuid = uuid(websiteId, hostname, ip, userAgent);

  let sessionCreated = false;
  let sessionId = null;
  let session = null;

  // Check if session exists
  if (process.env.REDIS_URL) {
    sessionCreated = (await redis.get(`session:${session_uuid}`)) !== null;
  } else {
    console.log('test');
    session = await getSessionByUuid(session_uuid);
    sessionCreated = !!session;
    sessionId = session ? session.session_id : null;
  }

  if (!sessionCreated) {
    try {
      console.log('test2');
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
