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
import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import kafka from '@/lib/kafka';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';

export interface CreateIdentityLinkArgs {
  websiteId: string;
  visitorId: string;
  distinctId: string;
}

export async function createIdentityLink(data: CreateIdentityLinkArgs) {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
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
