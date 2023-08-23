import { User, Website } from '@prisma/client';
import redis from '@umami/redis-client';
import { getSession, getUserById, getWebsiteById } from '../queries';

const { fetchObject, storeObject, deleteObject, expire } = redis;

async function fetchWebsite(id): Promise<Website> {
  return fetchObject(`website:${id}`, () => getWebsiteById(id), 86400);
}

async function storeWebsite(data) {
  const { id } = data;
  const key = `website:${id}`;

  const obj = await storeObject(key, data);
  await expire(key, 86400);

  return obj;
}

async function deleteWebsite(id) {
  return deleteObject(`website:${id}`);
}

async function fetchUser(id): Promise<User> {
  return fetchObject(`user:${id}`, () => getUserById(id, { includePassword: true }), 86400);
}

async function storeUser(data) {
  const { id } = data;
  const key = `user:${id}`;

  const obj = await storeObject(key, data);
  await expire(key, 86400);

  return obj;
}

async function deleteUser(id) {
  return deleteObject(`user:${id}`);
}

async function fetchSession(id) {
  return fetchObject(`session:${id}`, () => getSession(id), 86400);
}

async function storeSession(data) {
  const { id } = data;
  const key = `session:${id}`;

  const obj = await storeObject(key, data);
  await expire(key, 86400);

  return obj;
}

async function deleteSession(id) {
  return deleteObject(`session:${id}`);
}

async function fetchUserBlock(userId: string) {
  const key = `user:block:${userId}`;
  return redis.get(key);
}

async function incrementUserBlock(userId: string) {
  const key = `user:block:${userId}`;
  return redis.incr(key);
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
  fetchUserBlock,
  incrementUserBlock,
  enabled: redis.enabled,
};
