import debug from 'debug';
import prisma from '@/lib/prisma';

const log = debug('umami:rollups');

/**
 * Opt-in pre-aggregation support (see db/postgresql/rollups/).
 *
 * ROLLUPS_ENABLED=1        Route eligible queries through the hourly rollup
 *                          tables. Default: off. When off (or on any runtime
 *                          problem below) queries take the raw path unchanged.
 * ROLLUPS_MAX_LAG=10800    Maximum age (seconds) of the rollup watermark
 *                          before rollups are considered stale (refresh job
 *                          down) and queries fall back to the raw path.
 *
 * Eligibility is decided per query: only filterless, cohortless queries are
 * served from rollups; the hour-aligned span below the watermark comes from
 * the rollup tables and the remainder (partial leading/trailing hours plus
 * everything past the watermark) is merged in from the raw event table, so
 * enabled and disabled instances return identical numbers.
 */

const ENABLED = ['1', 'true'].includes(String(process.env.ROLLUPS_ENABLED).toLowerCase());
const MAX_LAG_MS = (Number(process.env.ROLLUPS_MAX_LAG) || 10800) * 1000;
const WATERMARK_CACHE_MS = 30_000;
const HOUR_MS = 3_600_000;

let cache: { at: number; value: Date | null } | null = null;

export function rollupsEnabled() {
  return ENABLED;
}

/**
 * Current rollup watermark, or null when rollups should not be used
 * (feature disabled, tables missing, refresh job stale, query error).
 * Cached briefly to avoid a database round-trip per dashboard panel.
 */
export async function getRollupWatermark(): Promise<Date | null> {
  if (!ENABLED) {
    return null;
  }

  const now = Date.now();

  if (cache && now - cache.at < WATERMARK_CACHE_MS) {
    return cache.value;
  }

  let value: Date | null = null;

  try {
    const rows = await prisma.rawQuery(
      `select processed_until as "processedUntil" from rollup_watermark where name = 'website_rollups'`,
      {},
      'getRollupWatermark',
    );
    const ts = rows?.[0]?.processedUntil ? new Date(rows[0].processedUntil) : null;

    if (ts && now - ts.getTime() <= MAX_LAG_MS) {
      value = ts;
    } else if (ts) {
      log('watermark stale, falling back to raw queries: %s', ts.toISOString());
    }
  } catch (e) {
    // Missing tables, permissions, etc: raw path.
    log(e);
  }

  cache = { at: now, value };

  return value;
}

export interface RollupRange {
  hstart: Date; // first whole-hour bucket inside the query range
  hend: Date; // exclusive bucket bound (min of range end, watermark)
}

/**
 * The hour-aligned sub-range of [startDate, endDate] servable from rollups,
 * or null if it contains less than one whole bucket (raw path is cheaper).
 * endDate is treated as inclusive, matching the raw queries' BETWEEN.
 */
export function getRollupRange(startDate: Date, endDate: Date, watermark: Date): RollupRange | null {
  const hstart = new Date(Math.ceil(startDate.getTime() / HOUR_MS) * HOUR_MS);
  const hend = new Date(
    Math.min(Math.floor((endDate.getTime() + 1) / HOUR_MS) * HOUR_MS, watermark.getTime()),
  );

  if (hend.getTime() - hstart.getTime() < HOUR_MS) {
    return null;
  }

  return { hstart, hend };
}
