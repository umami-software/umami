import clickhouse from '@/lib/clickhouse';
import { COMMERCE_METRIC_TYPES, type CommerceMetricType } from '@/lib/commerce-reports';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  getChannelSQL,
  getClickhouseCommerceQuery,
  getOrderBuyersCte,
  getRelationalCommerceQuery,
  getSessionAttributesCte,
  getVisitEntriesCte,
  toNumbers,
} from './commerceQuery';
import { requireClickhouseCommerceTables } from './commerceTables';

const FUNCTION_NAME = 'getCommerceMetrics';

/** Visitor attributes of the purchasing session. */
const SESSION_DIMENSIONS = [
  'country',
  'region',
  'city',
  'device',
  'browser',
  'os',
  'language',
] as const;
/** Acquisition of the visit in which the order was placed. */
const VISIT_DIMENSIONS = [
  'referrer',
  'channel',
  'entry',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
] as const;

export { COMMERCE_METRIC_TYPES, type CommerceMetricType };

export interface CommerceMetric {
  name: string;
  revenue: number;
  orders: number;
  buyers: number;
  country?: string;
}

const VISIT_COLUMNS: Record<(typeof VISIT_DIMENSIONS)[number], string> = {
  referrer: 'referrer_domain',
  channel: '',
  entry: 'url_path',
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
};

function isVisitDimension(type: string): type is (typeof VISIT_DIMENSIONS)[number] {
  return (VISIT_DIMENSIONS as readonly string[]).includes(type);
}

function isSessionDimension(type: string): type is (typeof SESSION_DIMENSIONS)[number] {
  return (SESSION_DIMENSIONS as readonly string[]).includes(type);
}

export async function getCommerceMetrics(
  ...args: [
    websiteId: string,
    parameters: CommerceParameters,
    filters: QueryFilters,
    type: CommerceMetricType,
    limit?: number,
  ]
): Promise<CommerceMetric[]> {
  const rows: CommerceMetric[] = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: async () => {
      await requireClickhouseCommerceTables();
      return clickhouseQuery(...args);
    },
  });

  return (rows || []).map(row => toNumbers(row, ['revenue', 'orders', 'buyers']));
}

function getDimension(dialect: 'prisma' | 'clickhouse', type: CommerceMetricType) {
  const empty = (expression: string) =>
    dialect === 'prisma' ? `coalesce(${expression}, '')` : expression;

  if (type === 'market') return { name: empty('orders.market') };
  if (type === 'event') return { name: 'orders.event_name' };
  if (type === 'region') return { name: empty('sa.region'), country: empty('sa.country') };
  if (isSessionDimension(type)) return { name: empty(`sa.${type}`) };
  if (type === 'channel') return { name: getChannelSQL(dialect, 've') };
  if (type === 'referrer') {
    return {
      name:
        dialect === 'prisma'
          ? `case when ve.referrer_domain = regexp_replace(ve.hostname, '^www.', '') then '' else coalesce(ve.referrer_domain, '') end`
          : `if(ve.referrer_domain = ve.hostname, '', ve.referrer_domain)`,
    };
  }

  return { name: empty(`ve.${VISIT_COLUMNS[type]}`) };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  type: CommerceMetricType,
  limit = 100,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);
  const dimension = getDimension('prisma', type);
  const extraCtes = [
    getOrderBuyersCte('prisma'),
    isSessionDimension(type) && getSessionAttributesCte('prisma'),
    isVisitDimension(type) && getVisitEntriesCte('prisma'),
  ]
    .filter(Boolean)
    .join(',');

  return rawQuery(
    `
    with ${ctes}, ${extraCtes}
    select
      ${dimension.name} as "name",
      ${dimension.country ? `${dimension.country} as "country",` : ''}
      sum(orders.value) as "revenue",
      count(*) as "orders",
      count(distinct order_buyers.buyer_id) as "buyers"
    from orders
    join order_buyers on order_buyers.commerce_event_id = orders.commerce_event_id
    ${isSessionDimension(type) ? 'left join session_attributes sa on sa.session_id = orders.session_id' : ''}
    ${isVisitDimension(type) ? 'left join visit_entries ve on ve.visit_id = orders.visit_id' : ''}
    group by ${dimension.country ? '1, 2' : '1'}
    order by "revenue" desc, "orders" desc, 1
    limit ${Math.max(1, Math.min(+limit || 100, 500))}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  type: CommerceMetricType,
  limit = 100,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);
  const dimension = getDimension('clickhouse', type);
  const extraCtes = [
    getOrderBuyersCte('clickhouse'),
    isSessionDimension(type) && getSessionAttributesCte('clickhouse'),
    isVisitDimension(type) && getVisitEntriesCte('clickhouse'),
  ]
    .filter(Boolean)
    .join(',');

  return rawQuery(
    `
    with ${ctes}, ${extraCtes}
    select
      ${dimension.name} as name,
      ${dimension.country ? `${dimension.country} as country,` : ''}
      sum(orders.value) as revenue,
      count() as orders,
      uniqExact(order_buyers.buyer_id) as buyers
    from orders
    inner join order_buyers on order_buyers.commerce_event_id = orders.commerce_event_id
    ${isSessionDimension(type) ? 'left join session_attributes as sa on sa.session_id = orders.session_id' : ''}
    ${isVisitDimension(type) ? 'left join visit_entries as ve on ve.visit_id = orders.visit_id' : ''}
    group by ${dimension.country ? 'name, country' : 'name'}
    order by revenue desc, orders desc, name
    limit ${Math.max(1, Math.min(+limit || 100, 500))}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
