import { getRankings } from 'lib/db';
import { useAuth } from 'lib/middleware';

const sessionColumns = ['browser', 'os', 'screen'];
const pageviewColumns = ['url', 'referrer'];

export default async (req, res) => {
  await useAuth(req, res);

  const { id, type, start_at, end_at } = req.query;

  if (!sessionColumns.includes(type) && !pageviewColumns.includes(type)) {
    return res.status(400).end();
  }

  const table = sessionColumns.includes(type) ? 'session' : 'pageview';

  const rankings = await getRankings(+id, new Date(+start_at), new Date(+end_at), type, table);

  return res.status(200).json(rankings);
};
