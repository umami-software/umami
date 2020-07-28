import { getPageviewData } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { id, start_at, end_at, unit, tz } = req.query;

  const [pageviews, uniques] = await Promise.all([
    getPageviewData(+id, new Date(+start_at), new Date(+end_at), tz, unit, '*'),
    getPageviewData(+id, new Date(+start_at), new Date(+end_at), tz, unit, 'distinct session_id'),
  ]);

  res.status(200).json({ pageviews, uniques });
};
