import { User, Website, Team, TeamUser } from '@prisma/client';
import redis from '@umami/redis-client';
import { lightFormat, startOfMonth } from 'date-fns';
import { getAllWebsitesByUser, getSession, getUser, getViewTotals, getWebsite } from '../queries';

const DELETED = 'DELETED';

async function fetchObject(key, query) {
  const obj = await redis.get(key);

  if (obj === DELETED) {
    return null;
  }

  if (!obj) {
    return query().then(async data => {
      if (data) {
        await redis.set(key, data);
      }

      return data;
    });
  }

  return obj;
}

async function storeObject(key, data) {
  return redis.set(key, data);
}

async function deleteObject(key, soft = false) {
  return soft ? redis.set(key, DELETED) : redis.del(key);
}

async function fetchWebsite(id): Promise<
  Website & {
    team?: Team & { teamUsers: TeamUser[] };
  }
> {
  return fetchObject(`website:${id}`, () => getWebsite({ id }, true));
}

async function storeWebsite(data) {
  const { id } = data;
  const key = `website:${id}`;

  return storeObject(key, data);
}

async function deleteWebsite(id) {
  return deleteObject(`website:${id}`);
}

async function fetchUser(id): Promise<User> {
  return fetchObject(`user:${id}`, () => getUser({ id }, { includePassword: true }));
}

async function storeUser(data) {
  const { id } = data;
  const key = `user:${id}`;

  return storeObject(key, data);
}

async function fetchCollectLimit(userId): Promise<Number> {
  const monthDate = startOfMonth(new Date());
  const monthKey = lightFormat(monthDate, 'yyyy-MM');

  return fetchObject(`collectLimit:${userId}:${monthKey}`, async () => {
    const websiteIds = (await getAllWebsitesByUser(userId)).map(a => a.id);

    return getViewTotals(websiteIds, monthDate).then(data => data.views);
  });
}

async function deleteCollectLimit(userId): Promise<Number> {
  const monthDate = startOfMonth(new Date());
  const monthKey = lightFormat(monthDate, 'yyyy-MM');

  return deleteObject(`collectLimit:${userId}:${monthKey}`);
}

async function incrementCollectLimit(userId): Promise<Number> {
  const monthDate = startOfMonth(new Date());
  const monthKey = lightFormat(monthDate, 'yyyy-MM');

  return redis.incr(`collectLimit:${userId}:${monthKey}`);
}

async function deleteUser(id) {
  return deleteObject(`user:${id}`);
}

async function fetchSession(id) {
  return fetchObject(`session:${id}`, () => getSession({ id }));
}

async function storeSession(data) {
  const { id } = data;
  const key = `session:${id}`;

  return storeObject(key, data);
}

async function deleteSession(id) {
  return deleteObject(`session:${id}`);
}

export default {
  fetchWebsite,
  storeWebsite,
  deleteWebsite,
  fetchUser,
  storeUser,
  deleteUser,
  fetchSession,
  storeSession,
  deleteSession,
  fetchCollectLimit,
  incrementCollectLimit,
  deleteCollectLimit,
  enabled: redis.enabled,
};
