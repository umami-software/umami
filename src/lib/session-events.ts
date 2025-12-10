import redis from './redis';

type SessionListener = (websiteId: string, sessionId: string) => void;

const listeners = new Map<string, Set<SessionListener>>();
const REDIS_CHANNEL = 'umami:session:created';

export function subscribeToSessions(websiteId: string, callback: SessionListener) {
  if (!listeners.has(websiteId)) {
    listeners.set(websiteId, new Set());
  }

  const websiteListeners = listeners.get(websiteId)!;
  websiteListeners.add(callback);

  return () => {
    websiteListeners.delete(callback);
    if (websiteListeners.size === 0) {
      listeners.delete(websiteId);
    }
  };
}

export async function emitSessionCreated(websiteId: string, sessionId: string) {
  const message = JSON.stringify({ websiteId, sessionId });

  if (redis.enabled) {
    await redis.client.publish(REDIS_CHANNEL, message);
  }

  listeners.get(websiteId)?.forEach(cb => cb(websiteId, sessionId));
}

let redisSubscriber: any = null;

export async function initializeRedisSubscriber() {
  if (!redis.enabled || redisSubscriber) {
    return;
  }

  redisSubscriber = redis.client.duplicate();
  await redisSubscriber.connect();

  await redisSubscriber.subscribe(REDIS_CHANNEL, (message: string) => {
    try {
      const { websiteId, sessionId } = JSON.parse(message);
      listeners.get(websiteId)?.forEach(cb => cb(websiteId, sessionId));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse session event:', error);
    }
  });
}
