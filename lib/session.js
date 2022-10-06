import { uuid } from 'lib/crypto';
import redis, { DELETED } from 'lib/redis';
import { getClientInfo, getJsonBody } from 'lib/request';
import { parseToken } from 'next-basics';
import { getWebsiteByUuid } from 'queries';
import { validate } from 'uuid';

export async function getSession(req) {
  const { payload } = getJsonBody(req);
  const hasRedis = process.env.REDIS_URL;

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
  if (hasRedis) {
    websiteId = Number(await redis.client.get(`website:${website_uuid}`));
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

  return {
    website_id: websiteId,
    session,
  };
}
