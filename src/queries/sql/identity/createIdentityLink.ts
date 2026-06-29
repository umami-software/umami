/**
 * Identity Stitching - Links anonymous browser sessions to authenticated user identities
 *
 * Design decisions:
 * - One visitor can link to multiple distinct_ids (user logs into different accounts)
 * - One distinct_id can link to multiple visitors (user on multiple devices/browsers)
 * - Links are additive and never invalidated (preserves historical journey)
 * - Uses ReplacingMergeTree in ClickHouse with linked_at for deduplication
 * - Upsert pattern ensures idempotency for repeated identify() calls
 *
 * Edge cases handled:
 * - Safari private browsing: visitorId will be undefined, no link created
 * - localStorage cleared: new visitorId generated, creates new link
 * - Multiple tabs: same visitorId shared via localStorage
 */

import clickhouse from '@/lib/clickhouse';
import { FIELD_LENGTH } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import { truncateString } from '@/lib/format';
import kafka from '@/lib/kafka';
import prisma from '@/lib/prisma';

export interface CreateIdentityLinkArgs {
  websiteId: string;
  visitorId: string;
  distinctId: string;
}

export async function createIdentityLink(data: CreateIdentityLinkArgs) {
  // Truncate to the column width (VARCHAR(50)) so long ids are stitched
  // consistently with how sessions/events store them, instead of failing the
  // write. The send endpoint accepts ids of any length and never rejects them.
  const normalized: CreateIdentityLinkArgs = {
    websiteId: data.websiteId,
    visitorId: truncateString(data.visitorId, FIELD_LENGTH.visitorId),
    distinctId: truncateString(data.distinctId, FIELD_LENGTH.distinctId),
  };

  return runQuery({
    [PRISMA]: () => relationalQuery(normalized),
    [CLICKHOUSE]: () => clickhouseQuery(normalized),
  });
}

async function relationalQuery({ websiteId, visitorId, distinctId }: CreateIdentityLinkArgs) {
  const { client } = prisma;

  return client.identityLink.upsert({
    where: {
      websiteId_visitorId_distinctId: {
        websiteId,
        visitorId,
        distinctId,
      },
    },
    update: {
      linkedAt: new Date(),
    },
    create: {
      id: uuid(),
      websiteId,
      visitorId,
      distinctId,
    },
  });
}

async function clickhouseQuery({ websiteId, visitorId, distinctId }: CreateIdentityLinkArgs) {
  const { insert, getUTCString } = clickhouse;
  const { sendMessage } = kafka;

  const now = getUTCString(new Date());
  const message = {
    website_id: websiteId,
    visitor_id: visitorId,
    distinct_id: distinctId,
    created_at: now,
    linked_at: now,
  };

  if (kafka.enabled) {
    await sendMessage('identity_link', message);
  } else {
    await insert('identity_link', [message]);
  }
}
