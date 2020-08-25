import { getRankings, getEvents } from 'lib/queries';
import { ok, badRequest } from 'lib/response';

const sessionColumns = ['browser', 'os', 'device', 'country'];
const pageviewColumns = ['url', 'referrer'];

export default async (req, res) => {
  const { id, type, start_at, end_at } = req.query;
  const websiteId = +id;
  const startDate = new Date(+start_at);
  const endDate = new Date(+end_at);

  if (type !== 'event' && !sessionColumns.includes(type) && !pageviewColumns.includes(type)) {
    return badRequest(res);
  }

  if (type === 'event') {
    const events = await getEvents(websiteId, startDate, endDate);

    return ok(res, events);
  }

  const table = sessionColumns.includes(type) ? 'session' : 'pageview';

  const rankings = await getRankings(websiteId, startDate, endDate, type, table);

  return ok(res, rankings);
};
