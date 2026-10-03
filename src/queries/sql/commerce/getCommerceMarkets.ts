import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  getClickhouseCommerceQuery,
  getRelationalCommerceQuery,
} from './commerceQuery';

export async function getCommerceMarkets(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const query = (dialect: 'prisma' | 'clickhouse') => {
    const { ctes, queryParams } = (
      dialect === 'prisma' ? getRelationalCommerceQuery : getClickhouseCommerceQuery
    )(websiteId, { ...parameters, market: undefined }, filters, { allStages: true });
    return (dialect === 'prisma' ? prisma : clickhouse).rawQuery(
      `with ${ctes} select market as name from orders where market is not null and market != '' group by market order by market`,
      queryParams,
      'getCommerceMarkets',
    );
  };
  return runQuery({ [PRISMA]: () => query('prisma'), [CLICKHOUSE]: () => query('clickhouse') });
}
