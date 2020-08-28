import { getRankings } from 'lib/queries';
import { ok, badRequest } from 'lib/response';

const sessionColumns = ['browser', 'os', 'device', 'country'];
const pageviewColumns = ['url', 'referrer'];

function getTable(type) {
  if (type === 'event') {
    return 'event';
  }

  if (sessionColumns.includes(type)) {
    return 'session';
  }

  return 'pageview';
}

function getColumn(type) {
  if (type === 'event') {
    return `concat(event_type, ':', event_value)`;
  }
  return type;
}

export default async (req, res) => {
  const { id, type, start_at, end_at } = req.query;
  const websiteId = +id;
  const startDate = new Date(+start_at);
  const endDate = new Date(+end_at);

  if (type !== 'event' && !sessionColumns.includes(type) && !pageviewColumns.includes(type)) {
    return badRequest(res);
  }

  const rankings = await getRankings(
    websiteId,
    startDate,
    endDate,
    getColumn(type),
    getTable(type),
  );

  return ok(res, rankings);
};
