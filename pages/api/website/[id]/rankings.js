import { getRankings } from 'lib/queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'lib/response';
import { DOMAIN_REGEX } from 'lib/constants';
import { allowQuery } from 'lib/auth';

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
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, type, start_at, end_at, domain } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (
      type !== 'event' &&
      !sessionColumns.includes(type) &&
      !pageviewColumns.includes(type) &&
      domain &&
      DOMAIN_REGEX.test(domain)
    ) {
      return badRequest(res);
    }

    const rankings = await getRankings(
      websiteId,
      startDate,
      endDate,
      getColumn(type),
      getTable(type),
      domain,
    );

    return ok(res, rankings);
  }

  return methodNotAllowed(res);
};
