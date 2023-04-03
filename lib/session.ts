import clickhouse from 'lib/clickhouse';
import { secret, uuid } from 'lib/crypto';
import { getClientInfo, getJsonBody } from 'lib/detect';
import { parseToken } from 'next-basics';
import { CollectRequestBody, NextApiRequestCollect } from 'pages/api/send';
import { createSession } from 'queries';
import { validate } from 'uuid';
import { loadSession, loadWebsite } from './query';

export async function findSession(req: NextApiRequestCollect) {
  const { payload } = getJsonBody<CollectRequestBody>(req);

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
  const website = await loadWebsite(websiteId);

  if (!website) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  const { userAgent, browser, os, ip, country, subdivision1, subdivision2, city, device } =
    await getClientInfo(req, payload);
  const sessionId = uuid(websiteId, hostname, ip, userAgent);

  // Clickhouse does not require session lookup
  if (clickhouse.enabled) {
    return {
      id: sessionId,
      websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      subdivision2,
      city,
    };
  }

  // Find session
  let session = await loadSession(sessionId);

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
        subdivision1,
        subdivision2,
        city,
      });
    } catch (e: any) {
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
  }

  return session;
}
