import Redis from 'ioredis';
import { startOfMonth } from 'date-fns';
import debug from 'debug';
import { getSessions, getAllWebsites } from 'queries';
import { REDIS } from 'lib/db';

const log = debug('umami:redis');
const INITIALIZED = 'redis:initialized';
export const DELETED = 'deleted';

function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const redis = new Redis(process.env.REDIS_URL);

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
    return { key: `session:${a.session_uuid}`, value: 1 };
  });
  const websiteIds = websites.map(a => {
    return { key: `website:${a.website_uuid}`, value: Number(a.website_id) };
  });

  await addRedis(sessionUuids);
  await addRedis(websiteIds);

  await redis.set(INITIALIZED, 1);
}

async function addRedis(ids) {
  for (let i = 0; i < ids.length; i++) {
    const { key, value } = ids[i];
    await redis.set(key, value);
  }
}

// Initialization
const redis = process.env.REDIS_URL && (global[REDIS] || getClient());

(async () => {
  if (redis && !(await redis.get(INITIALIZED))) {
    await stageData();
  }
})();

export default { client: redis, stageData, log };
