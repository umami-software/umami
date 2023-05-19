import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, MONGODB, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getPageviewStats(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      timezone?: string;
      unit?: string;
      count?: string;
      filters: object;
      sessionKey?: string;
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
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    count = '*',
    filters = {},
    sessionKey = 'session_id',
  } = criteria;
  const { toUuid, getDateQuery, parseFilters, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [websiteId, resetDate, startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${getDateQuery('website_event.created_at', unit, timezone)} x,
        count(${count !== '*' ? `${count}${sessionKey}` : count}) y
      from website_event
        ${joinSession}
      where website_event.website_id = $1${toUuid()}
        and website_event.created_at >= $2
        and website_event.created_at between $3 and $4
        and event_type = ${EVENT_TYPE.pageView}
        ${filterQuery}
      group by 1`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'UTC',
    unit = 'day',
    count = '*',
    filters = {},
  } = criteria;
  const {
    parseFilters,
    getDateFormat,
    rawQuery,
    getDateStringQuery,
    getDateQuery,
    getBetweenDates,
  } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params = { websiteId };
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select
      ${getDateStringQuery('g.t', unit)} as x, 
      g.y as y
    from
      (select 
        ${getDateQuery('created_at', unit, timezone)} t,
        count(${count !== '*' ? 'distinct session_id' : count}) y
      from website_event
      where website_id = {websiteId:UUID}
        and event_type = ${EVENT_TYPE.pageView}
        and created_at >= ${getDateFormat(resetDate)}
        and ${getBetweenDates('created_at', startDate, endDate)}
        ${filterQuery}
      group by t) g
    order by t`,
    params,
  );
}

async function mongodbQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    count = '*',
    filters = {},
  } = criteria;
  const { getDateQuery, client, parseMongoFilter } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const mongoFilter = parseMongoFilter(filters);
  let sessionInclude = '';
  let sessionGroupAggregation: any = { $match: {} };
  const sessionLookUpAggregation: any = {
    $lookup: {
      from: 'session',
      foreignField: '_id',
      localField: 'session_id',
      as: 'session',
    },
  };
  let sessionProjectAggregation: any = { $match: {} };

  if (count !== '*') {
    sessionInclude = 'session_id : 1';
    sessionGroupAggregation = {
      $group: {
        _id: {
          t: '$t',
          session_id: '$session_id',
        },
      },
    };
    sessionProjectAggregation = {
      $project: {
        t: '$_id.t',
      },
    };
  }
  return await client.websiteEvent.aggregateRaw({
    pipeline: [
      sessionLookUpAggregation,
      mongoFilter,
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ['$event_type', EVENT_TYPE.pageView],
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
            },
          },
          sessionInclude,
        },
      },
      sessionGroupAggregation,
      sessionProjectAggregation,
      {
        $group: {
          _id: {
            t: '$t',
            session_id: '$session_id',
          },
          y: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          x: {
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
          x: 1,
        },
      },
    ],
  });
}
