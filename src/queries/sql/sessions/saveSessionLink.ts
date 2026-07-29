import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'saveSessionLink';

export interface SaveSessionLinkArgs {
  websiteId: string;
  sessionId: string;
  distinctId: string;
  createdAt?: Date;
}

export async function saveSessionLink(data: SaveSessionLinkArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
}

async function relationalQuery({
  websiteId,
  sessionId,
  distinctId,
  createdAt,
}: SaveSessionLinkArgs) {
  const { writeRawQuery } = prisma;

  await writeRawQuery(
    `
    insert into session_link (
      website_id,
      session_id,
      distinct_id,
      created_at
    )
    values (
      {{websiteId}},
      {{sessionId}},
      {{distinctId}},
      {{createdAt}}
    )
    on conflict (website_id, distinct_id, session_id) do nothing
    `,
    {
      websiteId,
      sessionId,
      distinctId: truncateString(distinctId, FIELD_LENGTH.distinctId),
      createdAt,
    },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery({
  websiteId,
  sessionId,
  distinctId,
  createdAt,
}: SaveSessionLinkArgs) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const message = {
    website_id: websiteId,
    session_id: sessionId,
    distinct_id: truncateString(distinctId, FIELD_LENGTH.distinctId),
    created_at: getUTCString(createdAt),
  };

  if (kafka.enabled) {
    await sendMessage('session_link', [message]);
  } else {
    await insert('session_link', [message]);
  }
}
