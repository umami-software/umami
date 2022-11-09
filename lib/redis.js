import debug from 'debug';
import Redis from 'ioredis';
import { REDIS } from 'lib/db';

const log = debug('umami:redis');
export const DELETED = 'deleted';

let redis;
const enabled = Boolean(process.env.REDIS_URL);

function getClient() {
  if (!enabled) {
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

async function get(key) {
  await connect();

  try {
    return JSON.parse(await redis.get(key));
  } catch {
    return null;
  }
}

async function set(key, value) {
  await connect();

  return redis.set(key, JSON.stringify(value));
}

async function del(key) {
  await connect();

  return redis.del(key);
}

async function connect() {
  if (!redis && enabled) {
    redis = global[REDIS] || getClient();
  }

  return redis;
}

export default { enabled, client: redis, log, connect, get, set, del };
