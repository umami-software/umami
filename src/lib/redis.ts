import { REDIS, UmamiRedisClient } from '@umami/redis-client';

const enabled = !!process.env.REDIS_URL;

function getClient() {
  const redis = new UmamiRedisClient(process.env.REDIS_URL);

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = redis;
  }

  return redis;
}

const client = global[REDIS] || getClient();

export default { client, enabled };
