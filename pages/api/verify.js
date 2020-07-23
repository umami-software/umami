import { verifySecureToken } from 'lib/crypto';

export default async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verifySecureToken(token);
    res.status(200).send(payload);
  } catch {
    res.status(400).send('');
  }
};
