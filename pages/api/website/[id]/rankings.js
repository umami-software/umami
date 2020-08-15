import { getRankings } from 'lib/queries';
import { ok, badRequest } from 'lib/response';

const sessionColumns = ['browser', 'os', 'device', 'country'];
const pageviewColumns = ['url', 'referrer'];

export default async (req, res) => {
  const { id, type, start_at, end_at } = req.query;

  if (!sessionColumns.includes(type) && !pageviewColumns.includes(type)) {
    return badRequest(res);
  }

  const table = sessionColumns.includes(type) ? 'session' : 'pageview';

  const rankings = await getRankings(+id, new Date(+start_at), new Date(+end_at), type, table);

  return ok(res, rankings);
};
