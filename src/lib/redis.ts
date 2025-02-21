import { REDIS, UmamiRedisClient } from '@umami/redis-client';

const enabled = !!process.env.REDIS_URL;

function getClient() {
  const client = new UmamiRedisClient(process.env.REDIS_URL);

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = client;
  }

  return client;
}

const client = global[REDIS] || getClient();

export default { client, enabled };
