const DEFAULT_CORS_MAX_AGE = process.env.CORS_MAX_AGE || '86400';

export function getApiCorsHeaders(headers: HeadersInit = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-umami-cache',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': DEFAULT_CORS_MAX_AGE,
    ...headers,
  };
}

export function withCorsHeaders(response: Response, headers: HeadersInit = {}) {
  const nextHeaders = new Headers(response.headers);

  Object.entries(getApiCorsHeaders(headers)).forEach(([key, value]) => {
    nextHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders,
  });
}

export function corsPreflight(headers: HeadersInit = {}) {
  return new Response(null, {
    status: 204,
    headers: getApiCorsHeaders(headers),
  });
}
