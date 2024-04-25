import { User, Website } from '@prisma/client';
import redis from '@umami/redis-client';
import { getSession, getUser, getWebsite } from '../queries';

async function fetchWebsite(websiteId: string): Promise<Website> {
  return redis.client.fetch(`website:${websiteId}`, () => getWebsite(websiteId), 86400);
}

async function storeWebsite(data: { id: any }) {
  const { id } = data;
  const key = `website:${id}`;

  return redis.client.store(key, data, 86400);
}

async function deleteWebsite(id: any) {
  return redis.client.remove(`website:${id}`);
}

async function fetchUser(id: string): Promise<User> {
  return redis.client.fetch(`user:${id}`, () => getUser(id, { includePassword: true }), 86400);
}

async function storeUser(data: { id: any }) {
  const { id } = data;
  const key = `user:${id}`;

  return redis.client.store(key, data, 86400);
}

async function deleteUser(id: any) {
  return redis.client.remove(`user:${id}`);
}

async function fetchSession(id: string) {
  return redis.client.fetch(`session:${id}`, () => getSession(id), 86400);
}

async function storeSession(data: { id: any }) {
  const { id } = data;
  const key = `session:${id}`;

  return redis.client.store(key, data, 86400);
}

async function deleteSession(id: any) {
  return redis.client.remove(`session:${id}`);
}

async function fetchUserBlock(userId: string) {
  const key = `user:block:${userId}`;
  return redis.client.get(key);
}

async function incrementUserBlock(userId: string) {
  const key = `user:block:${userId}`;
  return redis.client.incr(key);
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
  enabled: !!redis.enabled,
};
