import cache from 'lib/cache';
import { getWebsite, getSession, getUser } from 'queries';
import { User, Website, Session } from '@prisma/client';
import { DEFAULT_RESET_DATE } from './constants';

export async function loadWebsite(websiteId: string): Promise<Website & { dataStartDate: Date }> {
  let website;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsite({ id: websiteId });
  }

  website.dataStartDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);

  if (!website || website.deletedAt) {
    return null;
  }

  return website;
}

export async function loadSession(sessionId: string): Promise<Session> {
  let session;

  if (cache.enabled) {
    session = await cache.fetchSession(sessionId);
  } else {
    session = await getSession({ id: sessionId });
  }

  if (!session) {
    return null;
  }

  return session;
}

export async function loadUser(userId: string): Promise<User> {
  let user;

  if (cache.enabled) {
    user = await cache.fetchUser(userId);
  } else {
    user = await getUser({ id: userId });
  }

  if (!user || user.deletedAt) {
    return null;
  }

  return user;
}
