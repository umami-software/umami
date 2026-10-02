import debug from 'debug';
import clickhouse from '@/lib/clickhouse';

const log = debug('umami:commerce');

const RECHECK_MS = 60_000;
const MIGRATION = 'db/clickhouse/migrations/15_add_commerce.sql';

let state: { exists: boolean; checkedAt: number } | null = null;

/**
 * Whether the ClickHouse commerce tables exist. ClickHouse migrations are applied by hand,
 * so an install may not have them yet. A positive answer is cached for the process; a
 * negative one is rechecked after a minute so applying the migration needs no restart.
 */
export async function hasClickhouseCommerceTables() {
  if (state?.exists || (state && Date.now() - state.checkedAt < RECHECK_MS)) {
    return state.exists;
  }

  const rows = await clickhouse.rawQuery<{ tables: number }[]>(
    `select uniqExact(name) as tables
    from system.tables
    where (database = currentDatabase() or is_temporary)
      and name in ('commerce_event', 'commerce_item')`,
  );
  const exists = Number(rows?.[0]?.tables) === 2;

  if (!exists && !state) {
    log(`ClickHouse commerce tables are missing. Apply ${MIGRATION}.`);
  }

  state = { exists, checkedAt: Date.now() };

  return exists;
}

/** Fails with an actionable message instead of querying tables that do not exist. */
export async function requireClickhouseCommerceTables() {
  if (!(await hasClickhouseCommerceTables())) {
    throw new Error(`ClickHouse commerce tables are missing. Apply ${MIGRATION}.`);
  }
}

/** For tests. */
export function resetCommerceTablesCheck() {
  state = null;
}
