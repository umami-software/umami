import { createClient } from 'redis';
import { startOfMonth } from 'date-fns';
import debug from 'debug';
import { getSessions, getAllWebsites } from 'queries';
import { REDIS } from 'lib/db';

const log = debug('umami:redis');
const INITIALIZED = 'redis:initialized';

async function getClient() {
  const redis = new createClient({
    url: process.env.REDIS_URL,
  });

  await redis.connect();

  if (process.env.LOG_QUERY) {
    redis.on('error', err => log(err));
  }

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = redis;
  }

  return redis;
}

async function stageData() {
  const sessions = await getSessions([], startOfMonth(new Date()).toUTCString());
  const websites = await getAllWebsites();

  const sessionUuids = sessions.map(a => {
    return { key: `session:${a.session_uuid}`, value: '' };
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
let redis = null;

(async () => {
  redis = process.env.REDIS_URL && (global[REDIS] || (await getClient()));

  if (redis) {
    if (!(await redis.get(INITIALIZED))) {
      await stageData();
    }
  }
})();

export default redis;
