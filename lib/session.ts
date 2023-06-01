import { secret, uuid } from 'lib/crypto';
import { getClientInfo, getJsonBody } from 'lib/detect';
import { parseToken } from 'next-basics';
import { CollectRequestBody, NextApiRequestCollect } from 'pages/api/send';
import { createSession } from 'queries';
import { validate } from 'uuid';
import cache from './cache';
import { loadSession, loadWebsite } from './query';

export async function findSession(req: NextApiRequestCollect) {
  const { payload } = getJsonBody<CollectRequestBody>(req);

  if (!payload) {
    throw new Error('Invalid payload.');
  }

  // Check if cache token is passed
  const cacheToken = req.headers['x-umami-cache'];

  if (cacheToken) {
    const result = await parseToken(cacheToken, secret());

    if (result) {
      await checkUserBlock(result?.ownerId);

      return result;
    }
  }

  // Verify payload
  const { website: websiteId, hostname, screen, language } = payload;

  if (!validate(websiteId)) {
    throw new Error('Invalid website ID.');
  }

  // Find website
  const website = await loadWebsite(websiteId);

  if (!website) {
    throw new Error(`Website not found: ${websiteId}.`);
  }

  await checkUserBlock(website.userId);

  const { userAgent, browser, os, ip, country, subdivision1, subdivision2, city, device } =
    await getClientInfo(req, payload);

  const sessionId = uuid(websiteId, hostname, ip, userAgent);

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

  return { ...session, ownerId: website.userId };
}

async function checkUserBlock(userId: string) {
  if (process.env.ENABLE_BLOCKER && (await cache.fetchUserBlock(userId))) {
    await cache.incrementUserBlock(userId);

    throw new Error('Usage Limit.');
  }
}
