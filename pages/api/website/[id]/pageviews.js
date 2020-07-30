import moment from 'moment-timezone';
import { getPageviewData } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { id, start_at, end_at, unit, tz } = req.query;

  if (!moment.tz.zone(tz) || !['hour', 'day'].includes(unit)) {
    return res.status(400).end();
  }

  const start = new Date(+start_at);
  const end = new Date(+end_at);

  const [pageviews, uniques] = await Promise.all([
    getPageviewData(+id, start, end, tz, unit, '*'),
    getPageviewData(+id, start, end, tz, unit, 'distinct session_id'),
  ]);

  return res.status(200).json({ pageviews, uniques });
};
