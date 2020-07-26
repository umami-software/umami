import { getPageviews } from 'lib/db';

export default async (req, res) => {
  console.log(req.query);
  const { id, start_at, end_at } = req.query;

  const pageviews = await getPageviews(+id, new Date(+start_at), new Date(+end_at));

  res.status(200).json({ pageviews });
};
