import { serializeError } from 'serialize-error';

export function ok() {
  return Response.json({ ok: true });
}

export function json(data: any) {
  return Response.json(data);
}

export function badRequest(message?: any) {
  return Response.json({ error: 'Bad request', message }, { status: 400 });
}

export function unauthorized(message?: any) {
  return Response.json({ error: 'Unauthorized', message }, { status: 401 });
}

export function forbidden(message?: any) {
  return Response.json({ error: 'Forbidden', message }, { status: 403 });
}

export function notFound(message?: any) {
  return Response.json({ error: 'Not found', message }, { status: 404 });
}

export function serverError(error?: any) {
  return Response.json({ error: 'Server error', message: serializeError(error) }, { status: 500 });
}
