import prisma, { getSchema } from '@/lib/prisma';

const transaction = prisma.transaction as <T>(
  input: (tx: any) => Promise<T>,
  options?: any,
) => Promise<T>;

export interface WebsiteDataCounts {
  events: number;
  eventData: number;
  sessions: number;
  revenue: number;
  replays: number;
  heatmaps: number;
}

// The delete statements take the same positional parameters:
// $1 website id, $2 range start (inclusive), $3 range end (exclusive).
const EVENTS_IN_RANGE = `website_event.website_id = $1::uuid
    and website_event.created_at >= $2
    and website_event.created_at < $3`;

// Event data is removed by two indexed statements, like the website reset does:
// its own duplicated website id and timestamp, then its parent event for legacy
// rows whose duplicates drifted. Rows matching both are removed by the first one.
const EVENT_DATA_OWN_RANGE = `event_data.website_id = $1::uuid
    and event_data.created_at >= $2
    and event_data.created_at < $3`;

const EVENT_DATA_BY_EVENT_JOIN = `event_data.website_event_id = website_event.event_id
    and ${EVENTS_IN_RANGE}`;

// Sessions whose events all fall inside the range. They are empty once the range is deleted.
// Driven from the events in range so it never walks every session of the website.
const ORPHAN_SESSIONS = `select candidate.session_id as id
  from (
    select distinct website_event.session_id from website_event where ${EVENTS_IN_RANGE}
  ) as candidate
  where not exists (
    select 1 from website_event
    where website_event.session_id = candidate.session_id
      and website_event.website_id = $1::uuid
      and (website_event.created_at < $2 or website_event.created_at >= $3 or website_event.created_at is null)
  )`;

const REPLAY_VISITS_IN_RANGE = `select distinct session_replay.visit_id as id
  from session_replay
  where session_replay.website_id = $1::uuid
    and session_replay.created_at >= $2
    and session_replay.created_at < $3`;

// Visits of orphan sessions, wherever their chunks sit. $2 is the orphan session ids.
const ORPHAN_SESSION_VISITS = `select distinct session_replay.visit_id as id
  from session_replay
  where session_replay.website_id = $1::uuid
    and session_replay.session_id = any($2::uuid[])`;

// The preview counts the range one month at a time so each query stays short.
// Its statements take $1 website id, $2 month start, $3 month end, $4 range start and
// $5 range end, so the range fragments above match the month. Each row is counted in
// exactly one month, so the months add up.

// Sessions with no event outside the range, counted in the month of their first event.
const PREVIEW_ORPHAN_SESSIONS = `select candidate.session_id as id
  from (
    select distinct website_event.session_id from website_event where ${EVENTS_IN_RANGE}
  ) as candidate
  where not exists (
    select 1 from website_event
    where website_event.session_id = candidate.session_id
      and website_event.website_id = $1::uuid
      and (website_event.created_at < $2 or website_event.created_at >= $5 or website_event.created_at is null)
  )`;

const PREVIEW_MONTH_COUNTS = `with orphan as (${PREVIEW_ORPHAN_SESSIONS})
select
  (select count(*) from orphan)::int as sessions,
  -- Event data in the month by its own timestamp, then by its parent event when the
  -- own timestamp leaves it to the second delete statement.
  ((select count(*) from event_data where ${EVENT_DATA_OWN_RANGE})
    + (select count(*) from event_data
      join website_event on ${EVENT_DATA_BY_EVENT_JOIN}
      where not (event_data.website_id = $1::uuid
        and event_data.created_at is not null
        and event_data.created_at >= $4
        and event_data.created_at < $5)))::int as event_data,
  -- Revenue of orphan sessions outside the range, deleted with the session.
  (select count(*) from revenue
    where revenue.website_id = $1::uuid
      and revenue.session_id in (select id from orphan)
      and (revenue.created_at < $4 or revenue.created_at >= $5 or revenue.created_at is null))::int as orphan_revenue,
  -- Heatmap events of orphan sessions outside the range, deleted with the session.
  (select count(*) from heatmap_event
    where heatmap_event.website_id = $1::uuid
      and heatmap_event.session_id in (select id from orphan)
      and (heatmap_event.created_at < $4 or heatmap_event.created_at >= $5))::int as orphan_heatmaps,
  -- Replays that lose every chunk. Replays with all chunks in the range are counted in
  -- the month of their first chunk.
  (select count(distinct session_replay.visit_id) from session_replay
    where session_replay.website_id = $1::uuid
      and session_replay.created_at >= $2
      and session_replay.created_at < $3
      and not exists (
        select 1 from session_replay other
        where other.website_id = $1::uuid
          and other.visit_id = session_replay.visit_id
          and (other.created_at < $2 or other.created_at >= $5 or other.created_at is null)
      ))::int
  -- Replays of orphan sessions with a chunk outside the range, deleted with the session.
  + (select count(distinct session_replay.visit_id) from session_replay
    where session_replay.website_id = $1::uuid
      and session_replay.session_id in (select id from orphan)
      and (session_replay.created_at < $4
        or session_replay.created_at >= $5
        or session_replay.created_at is null))::int as replays`;

// Tables a range delete removes rows from by their own timestamp. Every other row it
// removes hangs off an event in the range, so nothing is deleted outside their rows.
const RANGE_TABLES = ['website_event', 'event_data', 'revenue', 'session_replay', 'heatmap_event'];

const rangeAggregate = (fn: 'min' | 'max') =>
  RANGE_TABLES.map(
    table =>
      `(select ${fn}(created_at) from ${table}
        where website_id = $1::uuid and created_at >= $2 and created_at < $3)`,
  ).join(',\n    ');

// First and last row in [$2, $3). least and greatest skip tables with no rows.
const DATA_BOUNDS = `select
  least(${rangeAggregate('min')}) as first_at,
  greatest(${rangeAggregate('max')}) as last_at`;

// Replays left without any chunk. $2 is the visit ids that lost chunks.
const REMOVED_VISITS = `select count(*)::int as count
  from unnest($2::uuid[]) as visit(id)
  where not exists (
    select 1 from session_replay
    where session_replay.website_id = $1::uuid
      and session_replay.visit_id = visit.id
  )`;

// Rows that belong to an orphan session but can sit outside the range.
const SESSION_TABLES = [
  'session_data',
  'session_link',
  'session_replay',
  'heatmap_event',
  'revenue',
] as const;

async function setSearchPath(tx: any) {
  const schema = getSchema();

  if (schema) {
    await tx.$executeRawUnsafe(`SET search_path TO "${schema}";`);
  }
}

function rangeWhere(websiteId: string, startDate: Date, endDate: Date) {
  return { websiteId, createdAt: { gte: startDate, lt: endDate } };
}

async function countRows(tx: any, sql: string, params: unknown[]): Promise<number> {
  const [{ count }] = await tx.$queryRawUnsafe(sql, ...params);

  return Number(count);
}

async function selectIds(tx: any, sql: string, params: unknown[]): Promise<string[]> {
  const rows: { id: string }[] = await tx.$queryRawUnsafe(sql, ...params);

  return rows.map(({ id }) => id);
}

// Splits [startDate, endDate) into UTC calendar months.
function splitByMonth(startDate: Date, endDate: Date): [Date, Date][] {
  const months: [Date, Date][] = [];
  let cursor = startDate;

  while (cursor < endDate) {
    const nextMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
    const next = nextMonth < endDate ? nextMonth : endDate;

    months.push([cursor, next]);
    cursor = next;
  }

  return months;
}

function addCounts(total: WebsiteDataCounts, counts: WebsiteDataCounts): WebsiteDataCounts {
  return {
    events: total.events + counts.events,
    eventData: total.eventData + counts.eventData,
    sessions: total.sessions + counts.sessions,
    revenue: total.revenue + counts.revenue,
    replays: total.replays + counts.replays,
    heatmaps: total.heatmaps + counts.heatmaps,
  };
}

async function getMonthCounts(
  websiteId: string,
  monthStart: Date,
  monthEnd: Date,
  startDate: Date,
  endDate: Date,
): Promise<WebsiteDataCounts> {
  const where = rangeWhere(websiteId, monthStart, monthEnd);

  return transaction(
    async tx => {
      await setSearchPath(tx);

      const [row] = await tx.$queryRawUnsafe(
        PREVIEW_MONTH_COUNTS,
        websiteId,
        monthStart,
        monthEnd,
        startDate,
        endDate,
      );

      return {
        events: await tx.websiteEvent.count({ where }),
        eventData: Number(row.event_data),
        sessions: Number(row.sessions),
        revenue: (await tx.revenue.count({ where })) + Number(row.orphan_revenue),
        replays: Number(row.replays),
        heatmaps: (await tx.heatmapEvent.count({ where })) + Number(row.orphan_heatmaps),
      };
    },
    { timeout: 30000 },
  );
}

// The first and last data in the range, so the preview skips the empty months around it.
async function getDataBounds(
  websiteId: string,
  startDate: Date,
  endDate: Date,
): Promise<[Date, Date] | null> {
  return transaction(async tx => {
    await setSearchPath(tx);

    const [{ first_at, last_at }] = await tx.$queryRawUnsafe(
      DATA_BOUNDS,
      websiteId,
      startDate,
      endDate,
    );

    if (!first_at || !last_at) {
      return null;
    }

    // Ranges are half-open, so the last row needs an end just after it.
    return [new Date(first_at), new Date(new Date(last_at).getTime() + 1)];
  });
}

export async function getWebsiteDataCounts(
  websiteId: string,
  startDate: Date,
  endDate: Date,
): Promise<WebsiteDataCounts> {
  let total: WebsiteDataCounts = {
    events: 0,
    eventData: 0,
    sessions: 0,
    revenue: 0,
    replays: 0,
    heatmaps: 0,
  };
  const bounds = await getDataBounds(websiteId, startDate, endDate);

  if (!bounds) {
    return total;
  }

  // One transaction per month, so a long range never hits the transaction timeout.
  // The months only cover the data, but the orphan checks still use the full range.
  for (const [monthStart, monthEnd] of splitByMonth(...bounds)) {
    total = addCounts(
      total,
      await getMonthCounts(websiteId, monthStart, monthEnd, startDate, endDate),
    );
  }

  return total;
}

export async function clearWebsiteData(
  websiteId: string,
  startDate: Date,
  endDate: Date,
): Promise<WebsiteDataCounts> {
  const params = [websiteId, startDate, endDate];
  const where = rangeWhere(websiteId, startDate, endDate);

  return transaction(
    async tx => {
      await setSearchPath(tx);

      // Both sets depend on the rows in range, so collect them before deleting anything.
      const sessionIds = await selectIds(tx, ORPHAN_SESSIONS, params);
      const visitIds = await selectIds(tx, REPLAY_VISITS_IN_RANGE, params);
      // Orphan sessions also lose replay chunks outside the range, so their saved replays go too.
      const orphanVisitIds = sessionIds.length
        ? await selectIds(tx, ORPHAN_SESSION_VISITS, [websiteId, sessionIds])
        : [];
      const savedVisitIds = [...new Set([...visitIds, ...orphanVisitIds])];

      // Both statements are index-friendly. The second only sees rows the first left behind.
      const eventData =
        (await tx.$executeRawUnsafe(
          `delete from event_data where ${EVENT_DATA_OWN_RANGE}`,
          ...params,
        )) +
        (await tx.$executeRawUnsafe(
          `delete from event_data using website_event where ${EVENT_DATA_BY_EVENT_JOIN}`,
          ...params,
        ));
      const { count: revenueInRange } = await tx.revenue.deleteMany({ where });

      const { count: heatmapsInRange } = await tx.heatmapEvent.deleteMany({ where });

      await tx.sessionReplay.deleteMany({ where });

      const { count: events } = await tx.websiteEvent.deleteMany({ where });

      let sessions = 0;
      // Revenue and heatmap events of orphan sessions outside the range go with the session.
      let orphanRevenue = 0;
      let orphanHeatmaps = 0;

      if (sessionIds.length) {
        for (const table of SESSION_TABLES) {
          const deleted = await tx.$executeRawUnsafe(
            `delete from ${table} where website_id = $1::uuid and session_id = any($2::uuid[])`,
            websiteId,
            sessionIds,
          );

          if (table === 'revenue') {
            orphanRevenue = deleted;
          } else if (table === 'heatmap_event') {
            orphanHeatmaps = deleted;
          }
        }

        sessions = await tx.$executeRawUnsafe(
          `delete from session where website_id = $1::uuid and session_id = any($2::uuid[])`,
          websiteId,
          sessionIds,
        );
      }

      // Only replays with no chunk left count, so a replay that spans two batches counts once.
      const replays = savedVisitIds.length
        ? await countRows(tx, REMOVED_VISITS, [websiteId, savedVisitIds])
        : 0;

      if (savedVisitIds.length) {
        await tx.$executeRawUnsafe(
          `delete from session_replay_saved
          where website_id = $1::uuid
            and visit_id = any($2::uuid[])
            and not exists (
              select 1 from session_replay
              where session_replay.website_id = $1::uuid
                and session_replay.visit_id = session_replay_saved.visit_id
            )`,
          websiteId,
          savedVisitIds,
        );
      }

      return {
        events,
        eventData,
        sessions,
        revenue: revenueInRange + orphanRevenue,
        replays,
        heatmaps: heatmapsInRange + orphanHeatmaps,
      };
    },
    { timeout: 30000 },
  );
}
