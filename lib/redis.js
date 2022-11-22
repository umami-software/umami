import { createClient } from 'redis';
import debug from 'debug';

const log = debug('umami:redis');
const REDIS = Symbol();

let redis;
const enabled = Boolean(process.env.REDIS_URL);

async function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const client = createClient({ url: process.env.REDIS_URL });
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

  log({ key, data });

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

export default { enabled, client: redis, log, connect, get, set, del };
