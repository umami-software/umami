import cache from 'lib/cache';
import { getSession, getUserById, getWebsiteById } from 'queries';
import { User, Website, Session } from '@prisma/client';

export async function loadWebsite(websiteId: string): Promise<Website> {
  let website;

  if (cache.enabled) {
    website = await cache.fetchWebsite(websiteId);
  } else {
    website = await getWebsiteById(websiteId);
  }

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
    session = await getSession(sessionId);
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
    user = await getUserById(userId);
  }

  if (!user || user.deletedAt) {
    return null;
  }

  return user;
}
