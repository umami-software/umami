import clickhouse from '@/lib/clickhouse';
import { commerceStageSQL } from '@/lib/commerce-events';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  type CommerceStage,
  divide,
  getClickhouseCommerceQuery,
  getRelationalCommerceQuery,
  getSessionAttributesCte,
  toNumber,
  toNumbers,
} from './commerceQuery';

export interface CommerceCheckoutStage {
  stage: CommerceStage;
  /** Legacy field name; counts identified attempts, not sessions. */
  sessions: number;
  attempts: number;
  rate: number;
  stepRate: number;
}
export interface CommerceCheckout {
  stages: CommerceCheckoutStage[];
  abandonedCarts: number;
  abandonedCartValue: number;
  abandonedCheckouts: number;
  abandonedCheckoutValue: number;
  pendingCarts: number;
  pendingCheckouts: number;
  completedCheckouts: number;
  unlinkedEvents: number;
  unclassifiedEvents: number;
  orders: number;
  revenue: number;
  medianSecondsToOrder: number;
  medianSecondsCheckoutToOrder: number;
  windowHours: number;
}
export interface CommerceAbandonedCheckout {
  sessionId: string;
  stage: 'cart' | 'checkout';
  lastAt: string;
  cartId: string;
  checkoutId: string;
  eventName: string;
  lines: number;
  units: number;
  value: number;
  country: string;
  device: string;
}

/** Cohort starts are filtered; their outcomes may occur in another visit/session after the range. */
export function getCheckoutAttemptQuery(
  dialect: 'prisma' | 'clickhouse',
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  now = new Date(),
) {
  const build = dialect === 'prisma' ? getRelationalCommerceQuery : getClickhouseCommerceQuery;
  const windowHours = parameters.windowHours ?? 24;
  const windowMs = windowHours * 3600000;
  const scope = build(websiteId, parameters, filters);
  const context = build(
    websiteId,
    {
      ...parameters,
      startDate: new Date(+parameters.startDate - windowMs),
      endDate: new Date(Math.min(+now, +parameters.endDate + windowMs)),
    },
    {},
    { allStages: true },
  );
  const p = (name: string) => (dialect === 'prisma' ? `{{${name}}}` : `{${name}:DateTime64}`);
  const deadline =
    dialect === 'prisma'
      ? `a.first_at + interval '${windowHours} hours'`
      : `addHours(a.first_at, ${windowHours})`;
  const id = `case when stage = 'checkout' then coalesce(checkout_id, '') else coalesce(cart_id, '') end`;
  const historyStage = commerceStageSQL(dialect, 'history').sql;
  // Give filter CTE separate bounds: outcomes intentionally use the expanded window.
  const scopedCte = scope.filteredSessionsCte
    .replaceAll('{{startDate}}', '{{cohortStart}}')
    .replaceAll('{{endDate}}', '{{cohortEnd}}')
    .replaceAll('{startDate:DateTime64}', '{cohortStart:DateTime64}')
    .replaceAll('{endDate:DateTime64}', '{cohortEnd:DateTime64}');
  return {
    ctes: `${context.ctes}, ${scope.isSessionFiltered ? `${scopedCte},` : ''}
    candidates as (
      select activity_events.*, ${id} as attempt_id,
        coalesce(market, '') as attempt_market
      from orders as activity_events where stage in ('cart', 'checkout')
    ),
    historical_stages as (
      select history.cart_id, history.checkout_id, coalesce(history.market, '') as attempt_market,
        history.created_at, ${historyStage} as stage
      from ${dialect === 'clickhouse' ? '(select * from commerce_event final)' : 'commerce_event'} as history
      where history.website_id = ${dialect === 'prisma' ? '{{websiteId::uuid}}' : '{websiteId:UUID}'}
        and history.currency = ${dialect === 'prisma' ? '{{commerceCurrency}}' : '{commerceCurrency:String}'}
        and history.created_at <= ${p('cohortEnd')}
        and (history.checkout_id in (select attempt_id from candidates where stage = 'checkout')
          or history.cart_id in (select attempt_id from candidates where stage = 'cart'))
    ),
    historical_starts as (
      select stage, ${id} as attempt_id, attempt_market, min(created_at) as first_at
      from historical_stages
      where (stage, ${id}, attempt_market) in (select stage, attempt_id, attempt_market from candidates where attempt_id != '')
      group by stage, ${id}, attempt_market
    ),
    ranked_starts as (
      select c.*, h.first_at,
        first_value(c.session_id) over (partition by c.stage, c.attempt_id, c.attempt_market order by c.created_at, c.commerce_event_id) as start_session_id,
        row_number() over (partition by c.stage, c.attempt_id, c.attempt_market order by c.created_at desc, c.commerce_event_id) as rn
      from candidates c join historical_starts h
        on h.stage = c.stage and h.attempt_id = c.attempt_id and h.attempt_market = c.attempt_market
      where c.attempt_id != '' and c.created_at <= ${dialect === 'prisma' ? `h.first_at + interval '${windowHours} hours'` : `addHours(h.first_at, ${windowHours})`}
    ),
    attempts as (
      select * from ranked_starts
      where rn = 1 and first_at between ${p('cohortStart')} and ${p('cohortEnd')}
      ${scope.isSessionFiltered ? 'and start_session_id in (select session_id from filtered_sessions)' : ''}
    ),
    outcomes as (
      select a.stage, a.attempt_id, a.attempt_market,
        ${dialect === 'prisma' ? "min(case when e.stage = 'order' then e.created_at end)" : "minOrNullIf(e.created_at, e.stage = 'order')"} as paid_at,
        ${dialect === 'prisma' ? 'min(e.created_at)' : "minOrNullIf(e.created_at, e.stage in ('checkout', 'order'))"} as progressed_at
      from attempts a left join orders e on
        coalesce(e.market, '') = a.attempt_market
        and ((a.stage = 'checkout' and e.checkout_id = a.attempt_id and e.stage = 'order')
          or (a.stage = 'cart' and e.cart_id = a.attempt_id and e.stage in ('checkout', 'order')))
        and e.created_at > a.first_at and e.created_at <= ${deadline}
      group by a.stage, a.attempt_id, a.attempt_market
    ),
    attempt_results as (
      select a.*, o.paid_at, o.progressed_at,
        case when o.progressed_at is not null then 'completed'
          when ${deadline} > ${p('observedAt')} then 'pending' else 'abandoned' end as status
      from attempts a join outcomes o on a.stage = o.stage and a.attempt_id = o.attempt_id and a.attempt_market = o.attempt_market
    )`,
    params: {
      ...context.queryParams,
      ...Object.fromEntries(
        Object.entries(scope.queryParams).filter(
          ([key]) => !['startDate', 'endDate', 'lookbackDate'].includes(key),
        ),
      ),
      cohortStart: parameters.startDate,
      cohortEnd: parameters.endDate,
      observedAt: now,
    },
    windowHours,
    eventFilter: scope.isSessionFiltered
      ? 'and session_id in (select session_id from filtered_sessions)'
      : '',
  };
}

export function deriveCheckout(row: Record<string, unknown>, windowHours = 24): CommerceCheckout {
  const count = (name: string) => toNumber(row[name]);
  const cart = count('cartAttempts'),
    checkout = count('checkoutAttempts'),
    completed = count('completedCheckouts');
  return {
    stages: [
      { stage: 'cart', sessions: cart, attempts: cart, rate: 1, stepRate: 1 },
      { stage: 'checkout', sessions: checkout, attempts: checkout, rate: 1, stepRate: 1 },
      {
        stage: 'order',
        sessions: completed,
        attempts: completed,
        rate: divide(completed, checkout),
        stepRate: divide(completed, checkout),
      },
    ],
    abandonedCarts: count('abandonedCarts'),
    abandonedCartValue: count('abandonedCartValue'),
    abandonedCheckouts: count('abandonedCheckouts'),
    abandonedCheckoutValue: count('abandonedCheckoutValue'),
    pendingCarts: count('pendingCarts'),
    pendingCheckouts: count('pendingCheckouts'),
    completedCheckouts: completed,
    unlinkedEvents: count('unlinkedEvents'),
    unclassifiedEvents: count('unclassifiedEvents'),
    orders: count('orders'),
    revenue: count('revenue'),
    medianSecondsToOrder: count('medianSecondsToOrder'),
    medianSecondsCheckoutToOrder: count('medianSecondsCheckoutToOrder'),
    windowHours,
  };
}

export async function getCommerceCheckout(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
): Promise<CommerceCheckout> {
  const query = async (dialect: 'prisma' | 'clickhouse') => {
    const { ctes, params, windowHours, eventFilter } = getCheckoutAttemptQuery(
      dialect,
      websiteId,
      parameters,
      filters,
    );
    const p = (name: string) => (dialect === 'prisma' ? `{{${name}}}` : `{${name}:DateTime64}`);
    const count = (condition: string, alias: string) =>
      `coalesce(sum(case when ${condition} then 1 else 0 end), 0) as "${alias}"`;
    const value = (stage: string) =>
      `coalesce(sum(case when stage = '${stage}' and status = 'abandoned' then value else 0 end), 0)`;
    const median = (condition: string) =>
      dialect === 'prisma'
        ? `percentile_cont(0.5) within group (order by extract(epoch from (paid_at - first_at))) filter (where ${condition} and paid_at is not null)`
        : `quantileExactInclusiveIf(0.5)(toFloat64(dateDiff('millisecond', first_at, paid_at)) / 1000, ${condition} and paid_at is not null)`;
    const rows = await (dialect === 'prisma' ? prisma : clickhouse).rawQuery(
      `with ${ctes}
      select ${count("stage = 'cart'", 'cartAttempts')}, ${count("stage = 'checkout'", 'checkoutAttempts')},
      ${count("stage = 'checkout' and status = 'completed'", 'completedCheckouts')},
      ${count("stage = 'cart' and status = 'pending'", 'pendingCarts')},
      ${count("stage = 'checkout' and status = 'pending'", 'pendingCheckouts')},
      ${count("stage = 'cart' and status = 'abandoned'", 'abandonedCarts')},
      ${count("stage = 'checkout' and status = 'abandoned'", 'abandonedCheckouts')},
      ${value('cart')} as "abandonedCartValue", ${value('checkout')} as "abandonedCheckoutValue",
      ${median("stage = 'cart'")} as "medianSecondsToOrder",
      ${median("stage = 'checkout'")} as "medianSecondsCheckoutToOrder",
      (select count(*) from orders where stage = 'unclassified' and created_at between ${p('cohortStart')} and ${p('cohortEnd')} ${eventFilter}) as "unclassifiedEvents",
      (select count(*) from candidates where attempt_id = '' and created_at between ${p('cohortStart')} and ${p('cohortEnd')} ${eventFilter}) as "unlinkedEvents",
      (select count(*) from orders where stage = 'order' and created_at between ${p('cohortStart')} and ${p('cohortEnd')} ${eventFilter}) as orders,
      (select coalesce(sum(value), 0) from orders where stage = 'order' and created_at between ${p('cohortStart')} and ${p('cohortEnd')} ${eventFilter}) as revenue
      from attempt_results`,
      params,
      'getCommerceCheckout',
    );
    return deriveCheckout(rows?.[0] || {}, windowHours);
  };
  return runQuery({ [PRISMA]: () => query('prisma'), [CLICKHOUSE]: () => query('clickhouse') });
}

export async function getCommerceAbandonedCheckouts(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
): Promise<PageResult<CommerceAbandonedCheckout[]>> {
  const query = async (dialect: 'prisma' | 'clickhouse') => {
    const { ctes, params } = getCheckoutAttemptQuery(dialect, websiteId, parameters, filters);
    return (dialect === 'prisma' ? prisma : clickhouse).pagedRawQuery(
      `with ${ctes}, ${getSessionAttributesCte(dialect)}
      select a.start_session_id as "sessionId", a.stage, a.created_at as "lastAt", coalesce(a.cart_id, '') as "cartId",
        coalesce(a.checkout_id, '') as "checkoutId", a.event_name as "eventName", a.lines, a.units, a.value,
        coalesce(sa.country, '') as country, coalesce(sa.device, '') as device
      from attempt_results a left join session_attributes sa on sa.session_id = a.start_session_id
      where a.status = 'abandoned'
      order by a.created_at desc, a.stage, a.attempt_id
      `,
      params,
      { ...filters, orderBy: undefined, sortDescending: undefined },
      'getCommerceCheckout:abandoned',
    );
  };
  const result = await runQuery({
    [PRISMA]: () => query('prisma'),
    [CLICKHOUSE]: () => query('clickhouse'),
  });
  return {
    ...result,
    data: (result?.data || []).map((row: CommerceAbandonedCheckout) =>
      toNumbers(row, ['lines', 'units', 'value']),
    ),
  };
}
