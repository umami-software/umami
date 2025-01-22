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

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export function serverError(error: any) {
  return Response.json({ error: 'Server error', message: serializeError(error), status: 500 });
}
