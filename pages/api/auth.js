import { serialize } from 'cookie';
import { checkPassword, createSecureToken } from 'lib/crypto';
import { getAccount } from 'lib/db';
import { allowPost } from 'lib/middleware';

export default async (req, res) => {
  await allowPost(req, res);

  const { username, password } = req.body;

  const account = await getAccount(username);

  if (account && (await checkPassword(password, account.password))) {
    const { user_id, username, is_admin } = account;
    const token = await createSecureToken({ user_id, username, is_admin });
    const cookie = serialize('umami.auth', token, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });

    res.setHeader('Set-Cookie', [cookie]);

    res.status(200).send({ token });
  } else {
    res.status(401).end();
  }
};
