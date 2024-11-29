import { secret, uuid, visitSalt } from 'lib/crypto';
import { getClientInfo } from 'lib/detect';
import { parseToken } from 'next-basics';
import { NextApiRequestCollect } from 'pages/api/send';
import { createSession } from 'queries';
import clickhouse from './clickhouse';
import { fetchSession, fetchWebsite } from './load';
import { SessionData } from 'lib/types';

export async function getSession(req: NextApiRequestCollect): Promise<SessionData> {
  const { payload } = req.body;

  if (!payload) {
    throw new Error('Invalid payload.');
  }

  // Check if cache token is passed
  const cacheToken = req.headers['x-umami-cache'];

  if (cacheToken) {
    const result = await parseToken(cacheToken, secret());

    // Token is valid
    if (result) {
      return result;
    }
  }

  // Verify payload
  const { website: websiteId, hostname, screen, language } = payload;

  // Find website
  const website = await fetchWebsite(websiteId);

  if (!website) {
    throw new Error(`Website not found: ${websiteId}.`);
  }

  const { userAgent, browser, os, ip, country, subdivision1, subdivision2, city, device } =
    await getClientInfo(req);

  const sessionId = uuid(websiteId, hostname, ip, userAgent);
  const visitId = uuid(sessionId, visitSalt());

  // Clickhouse does not require session lookup
  if (clickhouse.enabled) {
    return {
      id: sessionId,
      websiteId,
      visitId,
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
  let session = await fetchSession(websiteId, sessionId);

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

  return { ...session, visitId: visitId };
}
