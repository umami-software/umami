import { serialize } from 'cookie';
import { checkPassword, createSecureToken } from 'lib/crypto';
import { getAccountByUsername } from 'lib/queries';
import { AUTH_COOKIE_NAME } from 'lib/constants';
import { ok, unauthorized, badRequest } from 'lib/response';

export default async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return badRequest(res);
  }

  const account = await getAccountByUsername(username);

  if (account && (await checkPassword(password, account.password))) {
    const { user_id, username, is_admin } = account;
    const token = await createSecureToken({ user_id, username, is_admin });
    const cookie = serialize(AUTH_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      sameSite: true,
      maxAge: 60 * 60 * 24 * 365,
    });

    res.setHeader('Set-Cookie', [cookie]);

    return ok(res, { token });
  }

  return unauthorized(res);
};
