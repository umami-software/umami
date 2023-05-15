import { subMinutes } from 'date-fns';
import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';

export async function getActiveVisitors(...args: [websiteId: string]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string) {
  const { getDatabaseType, toUuid, rawQuery, client } = prisma;
  const db = getDatabaseType();

  const date = subMinutes(new Date(), 5);
  const params: any = [websiteId, date];

  if (db === 'mongodb') {
    const result: any = await client.websiteEvent.aggregateRaw({
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$website_id', websiteId],
                },
                {
                  $gte: [
                    '$created_at',
                    {
                      $dateFromString: {
                        dateString: date.toISOString(),
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: '$session_id',
          },
        },
        {
          $count: 'x',
        },
      ],
    });
    if (result.length > 0) {
      return { x: result[0].x };
    } else {
      return { x: 0 };
    }
  } else {
    return rawQuery(
      `select count(distinct session_id) x
      from website_event
        join website
          on website_event.website_id = website.website_id
      where website.website_id = $1${toUuid()}
      and website_event.created_at >= $2`,
      params,
    );
  }
}

async function clickhouseQuery(websiteId: string) {
  const { rawQuery } = clickhouse;
  const params = { websiteId, startAt: subMinutes(new Date(), 5) };

  return rawQuery(
    `select count(distinct session_id) x
    from website_event
    where website_id = {websiteId:UUID}
    and created_at >= {startAt:DateTime('UTC')}`,
    params,
  );
}
