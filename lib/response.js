export function ok(res, data = {}) {
  return res.status(200).json(data);
}

export function redirect(res, url) {
  res.setHeader('Location', url);

  return res.status(303).end();
}

export function badRequest(res) {
  return res.status(400).end();
}

export function unauthorized(res) {
  return res.status(401).end();
}

export function forbidden(res) {
  return res.status(403).end();
}

export function methodNotAllowed(res) {
  res.status(405).end();
}
