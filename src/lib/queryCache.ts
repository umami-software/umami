import debug from 'debug';
import { md5 } from '@/lib/crypto';
import redis from '@/lib/redis';

const log = debug('umami:query-cache');

/**
 * Read-through Redis cache for expensive analytics API responses.
 *
 * Dashboard queries over large date ranges can take seconds even on tuned
 * databases, and every viewer of a dashboard repeats the identical query.
 * Caching the JSON response keyed by (website, endpoint, query parameters)
 * makes repeat loads instant and shields the database from concurrent
 * identical aggregations.
 *
 * Opt-in: enabled only when Redis is configured (REDIS_URL) and
 * QUERY_CACHE_TTL is set to a positive number of seconds. Two TTLs apply:
 *
 *   QUERY_CACHE_TTL           TTL for queries whose date range includes the
 *                             present (data still changing). Also acts as the
 *                             feature flag.
 *   QUERY_CACHE_HISTORIC_TTL  TTL for queries whose range ended in the past;
 *                             events are recorded with the current timestamp,
 *                             so closed ranges rarely change (default: 3600).
 *
 * Invalidation: keys embed a per-website epoch counter which is incremented
 * when a website is reset or deleted, orphaning all previously cached entries
 * for that website. Everything else expires by TTL.
 */

const CURRENT_TTL = Number(process.env.QUERY_CACHE_TTL) || 0;
const HISTORIC_TTL = Number(process.env.QUERY_CACHE_HISTORIC_TTL) || 3600;

// Ranges ending more than this many ms in the past are considered closed.
const CLOSED_RANGE_GRACE = 5 * 60 * 1000;

export function queryCacheEnabled() {
  return redis.enabled && CURRENT_TTL > 0;
}

function getEpochKey(websiteId: string) {
  return `query-cache-epoch:${websiteId}`;
}

function getCacheKey(websiteId: string, epoch: string, name: string, params: object) {
  // Sort keys so logically identical requests hash identically regardless of
  // parameter order.
  const normalized = JSON.stringify(params, Object.keys(params).sort());

  return `query-cache:${websiteId}:${epoch}:${name}:${md5(name, normalized)}`;
}

function getTTL(endDate?: Date) {
  if (endDate && endDate.getTime() < Date.now() - CLOSED_RANGE_GRACE) {
    return HISTORIC_TTL;
  }

  return CURRENT_TTL;
}

/**
 * Fetch a cached query result, computing and storing it on a miss.
 * Falls back to executing the query directly on any cache failure so that a
 * Redis outage degrades performance, never availability.
 */
export async function fetchQuery<T>(
  websiteId: string,
  name: string,
  params: object,
  endDate: Date | undefined,
  query: () => Promise<T>,
): Promise<T> {
  if (!queryCacheEnabled()) {
    return query();
  }

  // Cache errors are isolated from query errors: a Redis failure on the read
  // side falls back to one direct query, a query error propagates without a
  // retry, and a failed cache write still returns the computed result.
  let key: string | null = null;

  try {
    const epoch = (await redis.client.get(getEpochKey(websiteId))) ?? 0;

    key = getCacheKey(websiteId, epoch, name, params);

    const cached = await redis.client.get(key);

    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (e) {
    log(e);

    return query();
  }

  const result = await query();

  try {
    if (result !== null && result !== undefined) {
      await redis.client.set(key, result, getTTL(endDate));
    }
  } catch (e) {
    log(e);
  }

  return result;
}

/**
 * Invalidate all cached query results for a website by advancing its epoch.
 * Called when website data is reset or the website is deleted.
 */
export async function expireQueryCache(websiteId: string) {
  if (!redis.enabled) {
    return;
  }

  // Invalidation failures propagate: callers (reset, delete, segment edits)
  // must not report success while stale cached analytics remain servable.
  // The operations are idempotent, so a failed request can simply be retried.
  if (queryCacheEnabled()) {
    await redis.client.incr(getEpochKey(websiteId));
  }
}
