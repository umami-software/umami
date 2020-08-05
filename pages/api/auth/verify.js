import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.auth) {
    return res.status(200).json(req.auth);
  }

  return res.status(401).end();
};
