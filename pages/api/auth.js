import { serialize } from 'cookie';
import { hash, random, encrypt } from 'lib/crypto';

export default (req, res) => {
  const { password } = req.body;

  if (password === process.env.PASSWORD) {
    const expires = new Date(Date.now() + 31536000000);
    const id = random();
    const value = encrypt(`${id}:${hash(id)}`);

    const cookie = serialize('umami.auth', value, { expires, httpOnly: true });

    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).send('');
  } else {
    res.status(401).send('');
  }
};
