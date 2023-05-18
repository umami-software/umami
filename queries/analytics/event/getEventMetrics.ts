import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { WebsiteEventMetric } from 'lib/types';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getEventMetrics(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      timezone: string;
      unit: string;
      filters: {
        url: string;
        eventName: string;
      };
    },
  ]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { getDatabaseType, toUuid, rawQuery, getDateQuery, getFilterQuery, client } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [websiteId, resetDate, startDate, endDate];
  const filterQuery = getFilterQuery(filters, params);
  const db = getDatabaseType();

  if (db === 'mongodb') {
    return await client.websiteEvent.aggregateRaw({
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$event_type', EVENT_TYPE.customEvent],
                },
                {
                  $eq: ['$website_id', websiteId],
                },
                {
                  $gte: [
                    '$created_at',
                    {
                      $dateFromString: {
                        dateString: resetDate.toISOString(),
                      },
                    },
                  ],
                },
                {
                  $gte: [
                    '$created_at',
                    {
                      $dateFromString: {
                        dateString: startDate.toISOString(),
                      },
                    },
                  ],
                },
                {
                  lte: [
                    '$created_at',
                    {
                      $dateFromString: {
                        dateString: endDate.toISOString(),
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            t: {
              $dateTrunc: {
                date: '$created_at',
                unit: unit,
                timezone: timezone,
              },
            },
            event_name: 1,
          },
        },
        {
          $group: {
            _id: {
              t: '$t',
              name: '$event_name',
            },
            y: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            x: '$_id.name',
            t: {
              $dateToString: {
                date: '$_id.t',
                format: getDateQuery('', unit, timezone),
                timezone: timezone,
              },
            },
            y: 1,
            _id: 0,
          },
        },
        {
          $sort: {
            t: 1,
          },
        },
      ],
    });
  } else {
    return rawQuery(
      `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = $1${toUuid()}
      and created_at >= $2
      and created_at between $3 and $4
      and event_type = ${EVENT_TYPE.customEvent}
      ${filterQuery}
    group by 1, 2
    order by 2`,
      params,
    );
  }
}

async function clickhouseQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { rawQuery, getDateQuery, getDateFormat, getBetweenDates, getFilterQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params = { websiteId };

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and event_type = ${EVENT_TYPE.customEvent}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getFilterQuery(filters, params)}
    group by x, t
    order by t`,
    params,
  );
}
