import { ok, unauthorized, badRequest, checkPassword, createSecureToken } from 'next-basics';
import { getAccount } from 'queries';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return badRequest(res);
  }

  const account = await getAccount({ username });

  if (account && checkPassword(password, account.password)) {
    const { id, username, isAdmin, accountUuid } = account;
    const user = { userId: id, username, isAdmin, accountUuid };
    const token = createSecureToken(user, secret());

    return ok(res, { token, user });
  }

  return unauthorized(res);
};
