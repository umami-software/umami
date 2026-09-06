import { badRequest, notFound, serverError } from '@/lib/response';

// Route handlers declare their own concrete `params` shapes; `any` keeps the table assignable.
type RouteHandler = (request: Request, context: { params: Promise<any> }) => Promise<Response>;

type RouteModule = Partial<Record<'GET' | 'POST' | 'PUT' | 'DELETE', RouteHandler>>;

export interface DispatchRoute {
  method: 'GET' | 'POST';
  path: `/api/${string}`;
  load: () => Promise<RouteModule>;
}

/**
 * The API routes the embedded MCP server may call, dispatched in-process (no loopback HTTP).
 * This list must stay identical to `OAUTH_ROUTE_SCOPES` in `src/lib/oauth/scopes.ts`;
 * `dispatch.test.ts` enforces that. Anything not listed here is unreachable from MCP.
 */
export const MCP_DISPATCH_ROUTES: readonly DispatchRoute[] = [
  { method: 'GET', path: '/api/me', load: () => import('@/app/api/me/route') },
  { method: 'GET', path: '/api/websites', load: () => import('@/app/api/websites/route') },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}',
    load: () => import('@/app/api/websites/[websiteId]/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/active',
    load: () => import('@/app/api/websites/[websiteId]/active/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/daterange',
    load: () => import('@/app/api/websites/[websiteId]/daterange/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/stats',
    load: () => import('@/app/api/websites/[websiteId]/stats/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/pageviews',
    load: () => import('@/app/api/websites/[websiteId]/pageviews/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/metrics',
    load: () => import('@/app/api/websites/[websiteId]/metrics/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/metrics/expanded',
    load: () => import('@/app/api/websites/[websiteId]/metrics/expanded/route'),
  },
  {
    method: 'GET',
    path: '/api/realtime/{websiteId}',
    load: () => import('@/app/api/realtime/[websiteId]/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/events',
    load: () => import('@/app/api/websites/[websiteId]/events/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/events/stats',
    load: () => import('@/app/api/websites/[websiteId]/events/stats/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/events/series',
    load: () => import('@/app/api/websites/[websiteId]/events/series/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/event-data',
    load: () => import('@/app/api/websites/[websiteId]/event-data/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/event-data/stats',
    load: () => import('@/app/api/websites/[websiteId]/event-data/stats/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/event-data/properties',
    load: () => import('@/app/api/websites/[websiteId]/event-data/properties/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/event-data/values',
    load: () => import('@/app/api/websites/[websiteId]/event-data/values/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/sessions',
    load: () => import('@/app/api/websites/[websiteId]/sessions/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/sessions/stats',
    load: () => import('@/app/api/websites/[websiteId]/sessions/stats/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    load: () => import('@/app/api/websites/[websiteId]/sessions/[sessionId]/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/activity',
    load: () => import('@/app/api/websites/[websiteId]/sessions/[sessionId]/activity/route'),
  },
  {
    method: 'GET',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/properties',
    load: () => import('@/app/api/websites/[websiteId]/sessions/[sessionId]/properties/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/attribution',
    load: () => import('@/app/api/reports/attribution/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/breakdown',
    load: () => import('@/app/api/reports/breakdown/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/funnel',
    load: () => import('@/app/api/reports/funnel/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/journey',
    load: () => import('@/app/api/reports/journey/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/retention',
    load: () => import('@/app/api/reports/retention/route'),
  },
  {
    method: 'POST',
    path: '/api/reports/revenue',
    load: () => import('@/app/api/reports/revenue/route'),
  },
  { method: 'POST', path: '/api/reports/utm', load: () => import('@/app/api/reports/utm/route') },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface CompiledRoute extends DispatchRoute {
  pattern: RegExp;
  paramNames: string[];
}

function compile(route: DispatchRoute): CompiledRoute {
  const paramNames: string[] = [];
  const source = route.path
    .split('/')
    .map(segment => {
      const match = /^\{([^}]+)}$/.exec(segment);

      if (match) {
        paramNames.push(match[1]);
        return '([^/]+)';
      }

      return escapeRegExp(segment);
    })
    .join('/');

  return { ...route, pattern: new RegExp(`^${source}/?$`), paramNames };
}

const compiledRoutes = MCP_DISPATCH_ROUTES.map(compile);

export function matchDispatchRoute(method: string, pathname: string) {
  const apiIndex = pathname.indexOf('/api/');
  const apiPath = apiIndex >= 0 ? pathname.slice(apiIndex) : pathname;
  const upper = method.toUpperCase();

  for (const route of compiledRoutes) {
    if (route.method !== upper) {
      continue;
    }

    const match = route.pattern.exec(apiPath);

    if (match) {
      const params: Record<string, string> = {};

      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1]);
      });

      return { route, params };
    }
  }

  return null;
}

export type InProcessFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

/**
 * A `fetch` replacement that invokes App Router handlers directly. Used by the embedded MCP
 * endpoint so tool calls never leave the process, while still passing through the exact same
 * request parsing, authentication and permission checks as an external HTTP call.
 */
export function createInProcessFetch(): InProcessFetch {
  return async (input, init = {}) => {
    const url = new URL(input.toString());
    const method = (init.method ?? 'GET').toUpperCase();
    const matched = matchDispatchRoute(method, url.pathname);

    if (!matched) {
      return notFound({ message: `Route ${method} ${url.pathname} is not available to MCP.` });
    }

    let module: RouteModule;

    try {
      module = await matched.route.load();
    } catch (error) {
      return serverError(error);
    }

    const handler = module[method as keyof RouteModule];

    if (!handler) {
      return badRequest({ message: `Method ${method} is not supported.` });
    }

    const request = new Request(url, {
      method,
      headers: init.headers,
      body: init.body ?? undefined,
      signal: init.signal ?? undefined,
    });

    try {
      return await handler(request, { params: Promise.resolve(matched.params) });
    } catch (error) {
      return serverError(error);
    }
  };
}
