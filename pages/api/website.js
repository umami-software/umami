import { getWebsites } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { user_id } = req.auth;

  const websites = await getWebsites(user_id);

  res.status(200).json({ websites });
};
