import { serialize } from 'cookie';
import { AUTH_COOKIE_NAME } from 'lib/constants';
import { ok } from 'lib/response';

export default async (req, res) => {
  const cookie = serialize(AUTH_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  res.setHeader('Set-Cookie', [cookie]);

  return ok(res);
};
