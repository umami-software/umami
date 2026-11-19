import type { SeedState } from '../seed/state';

export const TIMEZONE = 'UTC';

/** `startAt`/`endAt` (ms) query params spanning the whole seeded dataset. */
export function dateRange(seed: SeedState, extra: Record<string, string | number> = {}) {
  return { startAt: seed.range.startAt, endAt: Date.now(), ...extra };
}

/** `startDate`/`endDate` ISO strings used by report parameters. */
export function dateRangeIso(seed: SeedState) {
  return {
    startDate: new Date(seed.range.startAt).toISOString(),
    endDate: new Date().toISOString(),
  };
}
