import { serialize } from 'cookie';
import { checkPassword, createToken, secret } from 'lib/crypto';
import { getAccount } from 'lib/db';

export default async (req, res) => {
  const { username, password } = req.body;

  const account = await getAccount(username);

  if (account && (await checkPassword(password, account.password))) {
    const { user_id, username, is_admin } = account;
    const token = await createToken({ user_id, username, is_admin });
    const expires = new Date(Date.now() + 31536000000);
    const cookie = serialize('umami.auth', token, { expires, httpOnly: true });

    res.setHeader('Set-Cookie', [cookie]);

    res.status(200).send({ token });
  } else {
    res.status(401).send('');
  }
};
