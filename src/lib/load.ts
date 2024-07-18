import { getSession, getWebsite } from 'queries';
import { Website, Session } from '@prisma/client';
import redis from '@umami/redis-client';

export async function fetchWebsite(websiteId: string): Promise<Website> {
  let website = null;

  if (redis.enabled) {
    website = await redis.client.fetch(`website:${websiteId}`, () => getWebsite(websiteId), 86400);
  } else {
    website = await getWebsite(websiteId);
  }

  if (!website || website.deletedAt) {
    return null;
  }

  return website;
}

export async function fetchSession(sessionId: string): Promise<Session> {
  let session = null;

  if (redis.enabled) {
    session = await redis.client.fetch(`session:${sessionId}`, () => getSession(sessionId), 86400);
  } else {
    session = await getSession(sessionId);
  }

  if (!session) {
    return null;
  }

  return session;
}
