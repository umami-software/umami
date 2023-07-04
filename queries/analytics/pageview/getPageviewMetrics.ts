import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA, MONGODB } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      column: string;
      filters: object;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [MONGODB]: () => mongodbQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, parseFilters, toUuid } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [
    websiteId,
    resetDate,
    startDate,
    endDate,
    column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];

  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = 'and website_event.referrer_domain != $6';
    params.push(website.domain);
  }

  const { filterQuery, joinSession } = parseFilters(filters, params);
  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = $1${toUuid()}
      and website_event.created_at >= $2
      and website_event.created_at between $3 and $4
      and event_type = $5
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 100`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, getDateFormat, parseFilters, getBetweenDates } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params = {
    websiteId,
    eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    domain: undefined,
  };

  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = 'and referrer_domain != {domain:String}';
    params.domain = website.domain;
  }

  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and event_type = {eventType:UInt32}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)} 
      ${excludeDomain}
      ${filterQuery}
    group by x
    order by y desc
    limit 100`,
    params,
  );
}

async function mongodbQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { parseMongoFilter, client } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [
    websiteId,
    resetDate,
    startDate,
    endDate,
    column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];

  let excludeDomainMongo: any = '';

  if (column === 'referrer_domain') {
    excludeDomainMongo = {
      $ne: ['$referrer_domain', website.domain],
    };
    params.push(website.domain);
  }
  const mongoFilter = parseMongoFilter(filters);
  return await client.websiteEvent.aggregateRaw({
    pipeline: [
      mongoFilter,
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ['$event_type', params[4]],
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
                $lte: [
                  '$created_at',
                  {
                    $dateFromString: {
                      dateString: endDate.toISOString(),
                    },
                  },
                ],
              },
              excludeDomainMongo,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$' + column,
          y: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          x: '$_id',
          y: 1,
          _id: 0,
        },
      },
      {
        $sort: {
          x: 1,
        },
      },
      {
        $sort: {
          y: -1,
        },
      },
      {
        $limit: 100,
      },
    ],
  });
}
