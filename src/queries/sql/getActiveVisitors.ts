import { subMinutes } from 'date-fns';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from '@/lib/db';

export async function getActiveVisitors(websiteId: string, pathPrefix?: string, host?: string) {
  return runQuery({
    [PRISMA]: () => relationalQuery(websiteId, pathPrefix, host),
    [CLICKHOUSE]: () => clickhouseQuery(websiteId, pathPrefix, host),
  });
}

async function relationalQuery(websiteId: string, pathPrefix?: string, host?: string) {
  const { rawQuery } = prisma;

  let sql = `
    select count(distinct session_id) as visitors
    from website_event
    where website_id = {{websiteId::uuid}}
    and created_at >= {{startDate}}
  `;
  const params: any = { websiteId, startDate: subMinutes(new Date(), 5) };

  if (pathPrefix) {
    sql += `
    and (
      url_path LIKE {{pathPrefix}}
      or url_path LIKE {{pathPrefixWithLang}}
    )`;
    params.pathPrefix = `${pathPrefix}%`;
    params.pathPrefixWithLang = `%/en${pathPrefix}%`;
  }

  if (host) {
    sql += ` and hostname LIKE {{host}}`;
    params.host = `%${host}%`;
  }

  const result = await rawQuery(sql, params);
  return result[0] ?? null;
}

async function clickhouseQuery(websiteId: string, pathPrefix?: string, host?: string): Promise<{ x: number }> {
  const { rawQuery } = clickhouse;

  let sql = `
    select
      count(distinct session_id) as \'visitors\'
    from website_event
    where website_id = {websiteId:UUID}
      and created_at >= {startDate:DateTime64}
  `;
  const params: any = { websiteId, startDate: subMinutes(new Date(), 5) };

  if (pathPrefix) {
    sql += `
      and (
        url_path LIKE {pathPrefix:String}
        or url_path LIKE {pathPrefixWithLang:String}
      )`;
    params.pathPrefix = `${pathPrefix}%`;
    params.pathPrefixWithLang = `%/en${pathPrefix}%`;
  }

  if (host) {
    sql += ` and hostname LIKE {host:String}`;
    params.host = `%${host}%`;
  }

  const result = await rawQuery(sql, params);
  return result[0] ?? null;
}
