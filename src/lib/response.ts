import { serializeError } from 'serialize-error';

export function ok() {
  return Response.json({ ok: true });
}

export function json(data: any) {
  return Response.json(data);
}

export function badRequest(error: any = 'Bad request') {
  return Response.json({ error: serializeError(error) }, { status: 400 });
}

export function unauthorized(error: any = 'Unauthorized') {
  return Response.json({ error: serializeError(error) }, { status: 401 });
}

export function forbidden(error: any = 'Forbidden') {
  return Response.json({ error: serializeError(error) }, { status: 403 });
}

export function notFound(error: any = 'Not found') {
  return Response.json({ error: serializeError(error) }, { status: 404 });
}

export function serverError(error: any = 'Server error') {
  return Response.json({ error: serializeError(error) }, { status: 500 });
}
