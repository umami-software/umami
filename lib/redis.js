import { createClient } from 'redis';
import debug from 'debug';

const log = debug('umami:redis');
const REDIS = Symbol();
const DELETED = 'DELETED';

let redis;
const url = process.env.REDIS_URL;
const enabled = Boolean(url);

async function getClient() {
  if (!enabled) {
    return null;
  }

  const client = createClient({ url });
  client.on('error', err => log(err));
  await client.connect();

  if (process.env.NODE_ENV !== 'production') {
    global[REDIS] = client;
  }

  log('Redis initialized');

  return client;
}

async function get(key) {
  await connect();

  const data = await redis.get(key);

  try {
    return JSON.parse(data);
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
    redis = global[REDIS] || (await getClient());
  }

  return redis;
}

export default { enabled, client: redis, log, connect, get, set, del, DELETED };
