import { Session, Team, Website } from '@prisma/client';
import cache from 'lib/cache';
import clickhouse from 'lib/clickhouse';
import { secret, uuid } from 'lib/crypto';
import { getClientInfo } from 'lib/detect';
import { parseToken } from 'next-basics';
import { createSession, getSession, getWebsite } from 'queries';

export async function findSession(
  req,
  payload,
): Promise<{
  id: string;
  websiteId: string;
  hostname: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
}> {
  const { website: websiteId, hostname, screen, language } = payload;

  const { userAgent, browser, os, ip, country, device } = await getClientInfo(req, payload);
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

  return session;
}

export async function useSessionCache(req: any): Promise<{
  id: string;
  websiteId: string;
  hostname: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  country: string;
}> {
  // Check if cache token is passed
  const cacheToken = req.headers['x-umami-cache'];

  if (cacheToken) {
    const result = await parseToken(cacheToken, secret());

    if (result) {
      return result;
    }
  }

  return null;
}

export async function findWebsite(websiteId: string) {
  let website: Website & { team?: Team } = null;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsite({ id: websiteId }, true);
  }

  if (!website || website.deletedAt) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  return website;
}

export async function isOverApiLimit(website) {
  const userId = website.userId ? website.userId : website.team.teamu.userId;

  const limit = await cache.fetchCollectLimit(userId);

  // To-do: Need to implement logic to find user-specific limit. Defaulted to 10k.
  if (limit > 10000) {
    return true;
  }

  await cache.incrementCollectLimit(userId);

  return false;
}
