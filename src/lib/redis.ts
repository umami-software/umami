import debug from 'debug';
import { createClient, type RedisClientType } from 'redis';

const log = debug('umami:redis-client');

export const DELETED = '__DELETED__';
export const DEFAULT_TTL = 3600;

const logError = (err: unknown) => log(err);

class UmamiRedisClient {
  url: string;
  client: RedisClientType;
  isConnected: boolean;

  constructor(url: string) {
    const client = createClient({ url }).on('error', logError);

    this.url = url;
    this.client = client as RedisClientType;
    this.isConnected = false;
  }

  async connect() {
    if (!this.isConnected) {
      this.isConnected = true;

      await this.client.connect();

      log('Redis connected');
    }
  }

  async get(key: string) {
    await this.connect();

    const data = await this.client.get(key);

    try {
      return JSON.parse(data as string);
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, time?: number) {
    await this.connect();

    const ttl = time && time > 0 ? time : DEFAULT_TTL;

    return this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  async del(key: string) {
    await this.connect();

    return this.client.del(key);
  }

  async incr(key: string) {
    await this.connect();

    return this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    await this.connect();

    return this.client.expire(key, seconds);
  }

  async rateLimit(key: string, limit: number, seconds: number): Promise<boolean> {
    await this.connect();

    const res = await this.client.incr(key);

    if (res === 1) {
      await this.client.expire(key, seconds);
    }

    return res >= limit;
  }

  async fetch(key: string, query: () => Promise<any>, time?: number) {
    const result = await this.get(key);

    if (result === DELETED) return null;

    if (!result && query) {
      const data = await query();
      if (data) {
        await this.set(key, data, time);
      }
      return data;
    }

    return result;
  }

  async remove(key: string, soft = false) {
    return soft ? this.set(key, DELETED) : this.del(key);
  }
}

const REDIS = 'redis';
const enabled = !!process.env.REDIS_URL;

function getClient() {
  const redis = new UmamiRedisClient(process.env.REDIS_URL);

  if (process.env.NODE_ENV !== 'production') {
    globalThis[REDIS] = redis;
  }

  return redis;
}

const client: UmamiRedisClient = globalThis[REDIS] || getClient();

export default { client, enabled };
