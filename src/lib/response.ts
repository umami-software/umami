import { serializeError } from 'serialize-error';

const PRIVATE_NO_STORE = 'private, no-store, max-age=0';

export function ok() {
  return Response.json({ ok: true });
}

export function json(data: Record<string, any> = {}) {
  return Response.json(data);
}

export function withNoStore(response: Response) {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', PRIVATE_NO_STORE);
  headers.set('Pragma', 'no-cache');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function noStoreJson(data: Record<string, any> = {}) {
  return Response.json(data, {
    headers: {
      'Cache-Control': PRIVATE_NO_STORE,
      Pragma: 'no-cache',
    },
  });
}

export function badRequest(error?: Record<string, any>) {
  return Response.json(
    {
      error: { message: 'Bad request', code: 'bad-request', status: 400, ...error },
    },
    { status: 400 },
  );
}

export function unauthorized(error?: Record<string, any>) {
  return Response.json(
    {
      error: {
        message: 'Unauthorized',
        code: 'unauthorized',
        status: 401,
        ...error,
      },
    },
    { status: 401 },
  );
}

export function forbidden(error?: Record<string, any>) {
  return Response.json(
    { error: { message: 'Forbidden', code: 'forbidden', status: 403, ...error } },
    { status: 403 },
  );
}

export function conflict(error?: Record<string, any>) {
  return Response.json(
    { error: { message: 'Conflict', code: 'conflict', status: 409, ...error } },
    { status: 409 },
  );
}

export function payloadTooLarge(error?: Record<string, any>) {
  return Response.json(
    {
      error: { message: 'Payload too large', code: 'payload-too-large', status: 413, ...error },
    },
    { status: 413 },
  );
}

export function tooManyRequests(error?: Record<string, any>) {
  return Response.json(
    {
      error: { message: 'Too many requests', code: 'too-many-requests', status: 429, ...error },
    },
    { status: 429 },
  );
}

export function notFound(error?: Record<string, any>) {
  return Response.json(
    { error: { message: 'Not found', code: 'not-found', status: 404, ...error } },
    { status: 404 },
  );
}

export function serverError(error?: unknown) {
  if (error && typeof error !== 'string') {
    // eslint-disable-next-line no-console
    console.log(serializeError(error));
  }

  return Response.json(
    {
      error: {
        message: typeof error === 'string' ? error : 'Server error',
        code: 'server-error',
        status: 500,
      },
    },
    { status: 500 },
  );
}
