import Redis from 'ioredis';
import { startOfMonth } from 'date-fns';
import debug from 'debug';
import { getSessions, getAllWebsites } from 'queries';
import { REDIS } from 'lib/db';

const log = debug('umami:redis');
const INITIALIZED = 'redis:initialized';
export const DELETED = 'deleted';

let redis;
const enabled = Boolean(process.env.REDIS_URL);

function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const redis = new Redis(process.env.REDIS_URL, {
    retryStrategy(times) {
      log(`Redis reconnecting attempt: ${times}`);
      return 5000;
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = redis;
  }

  log('Redis initialized');

  return redis;
}

async function stageData() {
  const sessions = await getSessions([], startOfMonth(new Date()));
  const websites = await getAllWebsites();

  const sessionUuids = sessions.map(a => {
    return { key: `session:${a.sessionUuid}`, value: 1 };
  });
  const websiteIds = websites.map(a => {
    return { key: `website:${a.websiteUuid}`, value: Number(a.websiteId) };
  });

  await addSet(sessionUuids);
  await addSet(websiteIds);

  await redis.set(INITIALIZED, 1);
}

async function addSet(ids) {
  for (let i = 0; i < ids.length; i++) {
    const { key, value } = ids[i];
    await redis.set(key, value);
  }
}

async function get(key) {
  await connect();

  return redis.get(key);
}

async function set(key, value) {
  await connect();

  return redis.set(key, value);
}

async function connect() {
  if (!redis) {
    redis = process.env.REDIS_URL && (global[REDIS] || getClient());
  }

  return redis;
}

export default { enabled, client: redis, log, connect, get, set, stageData };
