import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';

export interface GetLinkedVisitorIdsArgs {
  websiteId: string;
  distinctId: string;
}

export interface LinkedVisitorId {
  visitorId: string;
  linkedAt: Date;
}

export async function getLinkedVisitorIds(
  data: GetLinkedVisitorIdsArgs,
): Promise<LinkedVisitorId[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(data),
    [CLICKHOUSE]: () => clickhouseQuery(data),
  });
}

async function relationalQuery({
  websiteId,
  distinctId,
}: GetLinkedVisitorIdsArgs): Promise<LinkedVisitorId[]> {
  const { client } = prisma;

  const links = await client.identityLink.findMany({
    where: {
      websiteId,
      distinctId,
    },
    select: {
      visitorId: true,
      linkedAt: true,
    },
  });

  return links;
}

async function clickhouseQuery({
  websiteId,
  distinctId,
}: GetLinkedVisitorIdsArgs): Promise<LinkedVisitorId[]> {
  const { rawQuery } = clickhouse;

  return rawQuery<LinkedVisitorId[]>(
    `
    select
      visitor_id as visitorId,
      linked_at as linkedAt
    from identity_link final
    where website_id = {websiteId:UUID}
      and distinct_id = {distinctId:String}
    `,
    { websiteId, distinctId },
  );
}
