import { Session, Team, Website } from '@prisma/client';
import cache from 'lib/cache';
import clickhouse from 'lib/clickhouse';
import { secret, uuid } from 'lib/crypto';
import { getClientInfo, getJsonBody } from 'lib/detect';
import { parseToken } from 'next-basics';
import { createSession, getSession, getWebsite } from 'queries';
import { validate } from 'uuid';

export async function findSession(req): Promise<{
  error?: {
    status: number;
    message: string;
  };
  session?: {
    id: string;
    websiteId: string;
    hostname: string;
    browser: string;
    os: string;
    device: string;
    screen: string;
    language: string;
    country: string;
  };
  website?: Website & { team?: Team };
}> {
  const { payload } = getJsonBody(req);

  if (!payload) {
    return null;
  }

  // Verify payload
  const { website: websiteId, hostname, screen, language } = payload;

  // Find website
  let website: Website & { team?: Team } = null;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsite({ id: websiteId });
  }

  if (!website || website.deletedAt) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  // Check if cache token is passed
  const cacheToken = req.headers['x-umami-cache'];

  if (cacheToken) {
    const result = await parseToken(cacheToken, secret());

    if (result) {
      return { session: result, website };
    }
  }

  if (!validate(websiteId)) {
    return null;
  }

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
  const sessionId = uuid(websiteId, hostname, ip, userAgent);

  // Clickhouse does not require session lookup
  if (clickhouse.enabled) {
    return {
      session: {
        id: sessionId,
        websiteId,
        hostname,
        browser,
        os,
        device,
        screen,
        language,
        country,
      },
      website,
    };
  }

  // Find session
  let session: Session;

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
    } catch (e: any) {
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
  }

  return { session, website };
}
