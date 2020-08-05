import { serialize } from 'cookie';
import { AUTH_COOKIE_NAME } from 'lib/constants';

export default async (req, res) => {
  const cookie = serialize(AUTH_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  res.statusCode = 303;
  res.setHeader('Set-Cookie', [cookie]);
  res.setHeader('Location', '/login');

  return res.end();
};
