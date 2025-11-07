import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface EngagementMetricsParameters {
  websiteId: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
}

export interface EngagementMetricsData {
  avg_session_duration: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
  bounce_rate: number;
  total_sessions: number;
  total_pageviews: number;
}

export async function getEngagementMetrics(
  params: EngagementMetricsParameters,
): Promise<EngagementMetricsData> {
  const { websiteId, startDate, endDate } = params;

  const queryParams = {
    websiteId,
    startDate,
    endDate,
  };

  return runQuery({
    [PRISMA]: () => getEngagementMetricsPostgres(queryParams),
    [CLICKHOUSE]: () => getEngagementMetricsPostgres(queryParams),
  });
}

async function getEngagementMetricsPostgres(params: any): Promise<EngagementMetricsData> {
  const { websiteId, startDate, endDate } = params;
  const { rawQuery } = prisma;

  const result = await rawQuery(
    `
    select
      coalesce(avg(
        case when event_name = 'session_duration' and event_data->>'duration' is not null
          then (event_data->>'duration')::numeric
          else null
        end
      ), 0) as avg_session_duration,
      coalesce(avg(
        case when event_name = 'time_on_page' and event_data->>'time' is not null
          then (event_data->>'time')::numeric
          else null
        end
      ), 0) as avg_time_on_page,
      coalesce(avg(
        case when event_name = 'scroll_depth' and event_data->>'depth' is not null
          then (event_data->>'depth')::numeric
          else null
        end
      ), 0) as avg_scroll_depth,
      coalesce(
        (count(*) filter (where event_name = 'bounce')::float /
         nullif(count(distinct session_id), 0) * 100),
        0
      ) as bounce_rate,
      count(distinct session_id) as total_sessions,
      count(*) filter (where event_name = 'pageview') as total_pageviews
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
  `,
    params,
  );

  const row = result[0] || {};

  return {
    avg_session_duration: Number(row.avg_session_duration || 0),
    avg_time_on_page: Number(row.avg_time_on_page || 0),
    avg_scroll_depth: Number(row.avg_scroll_depth || 0),
    bounce_rate: Number(row.bounce_rate || 0),
    total_sessions: Number(row.total_sessions || 0),
    total_pageviews: Number(row.total_pageviews || 0),
  };
}

