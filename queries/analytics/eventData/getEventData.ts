import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { WebsiteEventDataMetric } from 'lib/types';
import { loadWebsite } from 'lib/query';

export async function getEventData(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      eventName: string;
      urlPath?: string;
      filters: [
        {
          eventKey?: string;
          eventValue?: string | number | boolean | Date;
        },
      ];
    },
  ]
): Promise<WebsiteEventDataMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    timeSeries?: {
      unit: string;
      timezone: string;
    };
    eventName: string;
    urlPath?: string;
    filters: [
      {
        eventKey?: string;
        eventValue?: string | number | boolean | Date;
      },
    ];
  },
) {
  const { startDate, endDate, timeSeries, eventName, urlPath, filters } = data;
  const { getDatabaseType, toUuid, rawQuery, getEventDataFilterQuery, getDateQuery, client } =
    prisma;
  const db = getDatabaseType();
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params: any = [websiteId, resetDate, startDate, endDate, eventName || ''];

  if (db === 'mongodb') {
    let joinAggregation: any = { match: {} };
    let matchAggregation: any = { match: {} };
    let eventTypeProjectProperty = '';
    let urlProjectProperty = '';
    if (eventName || urlPath) {
      joinAggregation = {
        $lookup: {
          from: 'website_event',
          localField: 'website_event_id',
          foreignField: '_id',
          as: 'result',
        },
      };
      eventTypeProjectProperty = 'event_name: {$arrayElemAt: ["$result.event_name", 0]}';
    }
    if (eventName) {
      matchAggregation = {
        $match: {
          'result.event_name': eventName,
        },
      };
    }
    if (urlPath) {
      urlProjectProperty = 'url_path: {$arrayElemAt: ["$result.url_path", 0],}';
    }
    let timeProjectProperty = '';
    if (timeSeries) {
      timeProjectProperty = `t: $dateTrunc: {date: "$created_at",unit: ${timeSeries.unit}, timezone : ${timeSeries.timezone}`;
    }
    return await client.websiteEvent.aggregateRaw({
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
        joinAggregation,
        matchAggregation,
        {
          $project: {
            eventTypeProjectProperty,
            timeProjectProperty,
            urlProjectProperty,
          },
        },
        {
          $group: {
            _id: {
              url_path: '$url_path',
              event_name: '$event_name',
              t: '$t',
            },
            x: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            url_path: '$_id.url_path',
            urlPath: '$_id.url_path',
            event_name: '$_id.event_name',
            eventName: '$_id.event_name',
            x: 1,
            t: '$_id.t',
            _id: 0,
          },
        },
      ],
    });
  } else {
    return rawQuery(
      `select
        count(*) x
        ${eventName ? `,event_name eventName` : ''}
        ${urlPath ? `,url_path urlPath` : ''}
        ${
          timeSeries ? `,${getDateQuery('created_at', timeSeries.unit, timeSeries.timezone)} t` : ''
        }
    from event_data
      ${
        eventName || urlPath
          ? 'join website_event on event_data.id = website_event.website_event_id'
          : ''
      }
    where website_id = $1${toUuid()}
      and created_at >= $2
      and created_at between $3 and $4
      ${eventName ? `and eventName = $5` : ''}
      ${getEventDataFilterQuery(filters, params)}
      ${timeSeries ? 'group by t' : ''}`,
      params,
    );
  }
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    timeSeries?: {
      unit: string;
      timezone: string;
    };
    eventName?: string;
    urlPath?: string;
    filters: [
      {
        eventKey?: string;
        eventValue?: string | number | boolean | Date;
      },
    ];
  },
) {
  const { startDate, endDate, timeSeries, eventName, urlPath, filters } = data;
  const { rawQuery, getDateFormat, getBetweenDates, getDateQuery, getEventDataFilterQuery } =
    clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || website?.createdAt);
  const params = { websiteId };

  return rawQuery(
    `select
        count(*) x
        ${eventName ? `,event_name eventName` : ''}
        ${urlPath ? `,url_path urlPath` : ''}
        ${
          timeSeries ? `,${getDateQuery('created_at', timeSeries.unit, timeSeries.timezone)} t` : ''
        }
    from event_data
    where website_id = {websiteId:UUID}
      ${eventName ? `and eventName = ${eventName}` : ''}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getEventDataFilterQuery(filters, params)}
      ${timeSeries ? 'group by t' : ''}`,
    params,
  );
}
