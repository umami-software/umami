export function ok(res, data = {}) {
  return res.status(200).json(data);
}

export function redirect(res, url) {
  res.setHeader('Location', url);

  return res.status(303).end();
}

export function badRequest(res, msg) {
  return res.status(400).end(msg);
}

export function unauthorized(res, msg) {
  return res.status(401).end(msg);
}

export function forbidden(res, msg) {
  return res.status(403).end(msg);
}

export function methodNotAllowed(res, msg) {
  res.status(405).end(msg);
}
