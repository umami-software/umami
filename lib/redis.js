import { createClient } from 'redis';
import { startOfMonth } from 'date-fns';
import { getSessions, getAllWebsites } from '/queries';

async function getClient() {
  const redis = new createClient({
    url: process.env.REDIS_URL,
  });

  await redis.connect();

  if (process.env.LOG_QUERY) {
    redis.on('error', err => console.log('Redis Client Error', err));
  }

  return redis;
}

let redis = null;

(async () => {
  redis = global.redis || (await getClient());

  if (process.env.NODE_ENV !== 'production') {
    global.redis = redis;
  }

  const value = await redis.get('initialized');

  if (!value) {
    await stageData();
  }
})();

export default redis;

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

  await redis.set('initialized', 'initialized');
}

async function addRedis(ids) {
  for (let i = 0; i < ids.length; i++) {
    const { key, value } = ids[i];
    await redis.set(key, value);
  }
}
