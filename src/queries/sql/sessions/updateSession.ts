import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'updateSession';

export interface UpdateSessionArgs {
  websiteId: string;
  sessionId: string;
  distinctId: string;
}

export async function updateSession(data: UpdateSessionArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(),
  });
}

async function relationalQuery({ websiteId, sessionId, distinctId }: UpdateSessionArgs) {
  const { writeRawQuery } = prisma;

  await writeRawQuery(
    `
    update session
    set distinct_id = {{distinctId}}
    where website_id = {{websiteId}}
      and session_id = {{sessionId}}
      and coalesce(distinct_id, '') != {{distinctId}}
    `,
    {
      websiteId,
      sessionId,
      distinctId: truncateString(distinctId, FIELD_LENGTH.distinctId),
    },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery() {
  if (!clickhouse.enabled) {
    return;
  }

  // ClickHouse session reads fall back to session_link because session rows are event-derived.
  return;
}
