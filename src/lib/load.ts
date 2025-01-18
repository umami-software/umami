import { serializeError } from 'serialize-error';
import { getWebsiteSession, getWebsite } from 'queries';
import { Website, Session } from '@prisma/client';
import { getClient, redisEnabled } from '@umami/redis-client';

export async function fetchWebsite(websiteId: string): Promise<Website> {
  let website = null;

  try {
    if (redisEnabled) {
      const redis = getClient();

      website = await redis.fetch(`website:${websiteId}`, () => getWebsite(websiteId), 86400);
    } else {
      website = await getWebsite(websiteId);
    }

    if (!website || website.deletedAt) {
      return null;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('FETCH WEBSITE ERROR:', serializeError(e));
  }

  return website;
}

export async function fetchSession(websiteId: string, sessionId: string): Promise<Session> {
  let session = null;

  try {
    if (redisEnabled) {
      const redis = getClient();

      session = await redis.fetch(
        `session:${sessionId}`,
        () => getWebsiteSession(websiteId, sessionId),
        86400,
      );
    } else {
      session = await getWebsiteSession(websiteId, sessionId);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('FETCH SESSION ERROR:', serializeError(e));
  }

  if (!session) {
    return null;
  }

  return session;
}
