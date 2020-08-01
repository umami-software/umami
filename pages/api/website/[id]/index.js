import { getWebsite } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { id } = req.query;

  const website = await getWebsite(id);

  return res.status(200).json(website);
};
