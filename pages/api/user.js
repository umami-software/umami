import { verifySecureToken } from 'lib/crypto';

export default async (req, res) => {
  const { token } = req.body;

  try {
    const payload = await verifySecureToken(token);
    return res.status(200).json(payload);
  } catch {
    return res.status(400).end();
  }
};
