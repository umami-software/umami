import { User, Website } from '@prisma/client';
import redis from '@umami/redis-client';
import { getSession, getUser, getWebsite } from '../queries';

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

async function fetchWebsite(id): Promise<Website> {
  return fetchObject(`website:${id}`, () => getWebsite({ id }));
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
  enabled: redis.enabled,
};
