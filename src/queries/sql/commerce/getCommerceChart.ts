import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  getClickhouseCommerceQuery,
  getRelationalCommerceQuery,
  toNumbers,
} from './commerceQuery';
import { requireClickhouseCommerceTables } from './commerceTables';

const FUNCTION_NAME = 'getCommerceChart';

/** Revenue (`y`) and orders (`count`) per time bucket (`t`) and event name (`x`). */
export interface CommerceChartPoint {
  x: string;
  t: string;
  y: number;
  count: number;
}

export async function getCommerceChart(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<{ chart: CommerceChartPoint[] }> {
  const rows: CommerceChartPoint[] = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: async () => {
      await requireClickhouseCommerceTables();
      return clickhouseQuery(...args);
    },
  });

  return { chart: (rows || []).map(row => toNumbers(row, ['y', 'count'])) };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery, getDateSQL } = prisma;
  const { unit = 'day', timezone = 'utc' } = parameters;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);

  return rawQuery(
    `
    with ${ctes}
    select
      orders.event_name as "x",
      ${getDateSQL('orders.created_at', unit, timezone)} as "t",
      sum(orders.value) as "y",
      count(*) as "count"
    from orders
    group by 1, 2
    order by 2
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery, getDateSQL } = clickhouse;
  const { unit = 'day', timezone = 'utc' } = parameters;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);

  return rawQuery(
    `
    with ${ctes}
    select
      orders.event_name as x,
      ${getDateSQL('orders.created_at', unit, timezone)} as t,
      sum(orders.value) as y,
      count() as count
    from orders
    group by x, t
    order by t
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
