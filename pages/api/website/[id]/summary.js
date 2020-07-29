import { getPageviews } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  console.log(req.query);
  const { id, start_at, end_at } = req.query;

  const pageviews = await getPageviews(+id, new Date(+start_at), new Date(+end_at));

  return res.status(200).json({ pageviews });
};
