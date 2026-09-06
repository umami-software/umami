/**
 * OAuth scopes and the allowlist of API routes that accept OAuth access tokens.
 *
 * This module is the single source of truth for both:
 *   - the OpenAPI document (`src/openapi`), which advertises the scope per operation, and
 *   - runtime enforcement (`src/lib/auth.ts`), which rejects OAuth tokens on routes that
 *     have not explicitly opted in.
 *
 * It must remain free of environment-dependent side effects so that it can be imported
 * from build scripts.
 */

export const OAUTH_SCOPES = ['websites:read', 'analytics:read'] as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[number];

export const OAUTH_SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  'websites:read': 'List and view websites you have access to.',
  'analytics:read': 'Read analytics data (traffic, metrics, events, sessions, reports).',
};

export type OAuthHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface OAuthRouteScope {
  method: OAuthHttpMethod;
  path: `/api/${string}`;
  scope: OAuthScope;
}

/**
 * Routes that accept OAuth access tokens, and the scope each one requires.
 * Paths use OpenAPI-style `{param}` placeholders and must match a discovered route exactly.
 *
 * Any route not listed here rejects OAuth authentication. Keep this list limited to what the
 * MCP server needs; expanding it is an explicit product decision.
 */
export const OAUTH_ROUTE_SCOPES: readonly OAuthRouteScope[] = [
  // Account
  { method: 'get', path: '/api/me', scope: 'websites:read' },

  // Websites
  { method: 'get', path: '/api/websites', scope: 'websites:read' },
  { method: 'get', path: '/api/websites/{websiteId}', scope: 'websites:read' },
  { method: 'get', path: '/api/websites/{websiteId}/active', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/daterange', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/stats', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/pageviews', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/metrics', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/metrics/expanded', scope: 'analytics:read' },
  { method: 'get', path: '/api/realtime/{websiteId}', scope: 'analytics:read' },

  // Events
  { method: 'get', path: '/api/websites/{websiteId}/events', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/events/stats', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/events/series', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/event-data', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/event-data/stats', scope: 'analytics:read' },
  {
    method: 'get',
    path: '/api/websites/{websiteId}/event-data/properties',
    scope: 'analytics:read',
  },
  { method: 'get', path: '/api/websites/{websiteId}/event-data/values', scope: 'analytics:read' },

  // Sessions
  { method: 'get', path: '/api/websites/{websiteId}/sessions', scope: 'analytics:read' },
  { method: 'get', path: '/api/websites/{websiteId}/sessions/stats', scope: 'analytics:read' },
  {
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}',
    scope: 'analytics:read',
  },
  {
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/activity',
    scope: 'analytics:read',
  },
  {
    method: 'get',
    path: '/api/websites/{websiteId}/sessions/{sessionId}/properties',
    scope: 'analytics:read',
  },

  // Reports (read/query only; saved-report CRUD is intentionally excluded)
  { method: 'post', path: '/api/reports/attribution', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/breakdown', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/funnel', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/journey', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/retention', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/revenue', scope: 'analytics:read' },
  { method: 'post', path: '/api/reports/utm', scope: 'analytics:read' },
];

export function isOAuthScope(value: unknown): value is OAuthScope {
  return typeof value === 'string' && (OAUTH_SCOPES as readonly string[]).includes(value);
}

export function parseScopes(value?: string | null): string[] {
  return (value ?? '')
    .split(/[\s,]+/)
    .map(scope => scope.trim())
    .filter(Boolean);
}

export function normalizeScopes(scopes: string[]): OAuthScope[] {
  return [...new Set(scopes.filter(isOAuthScope))].sort() as OAuthScope[];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPattern(path: string) {
  const source = path
    .split('/')
    .map(segment => (/^\{[^}]+}$/.test(segment) ? '[^/]+' : escapeRegExp(segment)))
    .join('/');

  return new RegExp(`^${source}/?$`);
}

const routePatterns = OAUTH_ROUTE_SCOPES.map(route => ({
  ...route,
  pattern: toPattern(route.path),
}));

/**
 * Returns the scope required to call the given route with an OAuth token, or `null` when the
 * route does not accept OAuth authentication at all.
 *
 * `pathname` is a concrete request path (e.g. `/api/websites/1234/stats`). Any `BASE_PATH`
 * or API URL prefix must be stripped by the caller.
 */
export function getRouteOAuthScope(method: string, pathname: string): OAuthScope | null {
  const normalizedMethod = method.toLowerCase();
  const apiIndex = pathname.indexOf('/api/');
  const apiPath = apiIndex >= 0 ? pathname.slice(apiIndex) : pathname;

  for (const route of routePatterns) {
    if (route.method === normalizedMethod && route.pattern.test(apiPath)) {
      return route.scope;
    }
  }

  return null;
}

export function getContractOAuthScope(method: string, path: string): OAuthScope | null {
  const normalizedMethod = method.toLowerCase();

  return (
    OAUTH_ROUTE_SCOPES.find(route => route.method === normalizedMethod && route.path === path)
      ?.scope ?? null
  );
}

export function hasRequiredScope(granted: readonly string[], required: OAuthScope) {
  return granted.includes(required);
}
