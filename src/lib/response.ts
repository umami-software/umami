export function ok() {
  return Response.json({ ok: true });
}

export function json(data: any = {}) {
  return Response.json(data);
}

export function badRequest(error?: any) {
  return Response.json(
    {
      error: { message: 'Bad request', code: 'bad-request', status: 400, ...error },
    },
    { status: 400 },
  );
}

export function unauthorized(error?: any) {
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

export function forbidden(error?: any) {
  return Response.json(
    { error: { message: 'Forbidden', code: 'forbidden', status: 403, ...error } },
    { status: 403 },
  );
}

export function notFound(error?: any) {
  return Response.json(
    { error: { message: 'Not found', code: 'not-found', status: 404, ...error } },
    { status: 404 },
  );
}

export function serverError(error?: any) {
  return Response.json(
    {
      error: {
        message: 'Server error',
        code: 'server-error',
        status: 500,
        ...error,
      },
    },
    { status: 500 },
  );
}
