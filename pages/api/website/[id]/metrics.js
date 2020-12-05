import { getPageviewMetrics, getSessionMetrics } from 'lib/queries';
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
    return `concat(event_type, '\t', event_value)`;
  }
  return type;
}

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, type, start_at, end_at, domain, url } = req.query;

    if (domain && !DOMAIN_REGEX.test(domain)) {
      return badRequest(res);
    }

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (sessionColumns.includes(type)) {
      const data = await getSessionMetrics(websiteId, startDate, endDate, type, { url });

      return ok(res, data);
    }

    if (type === 'event' || pageviewColumns.includes(type)) {
      const data = await getPageviewMetrics(
        websiteId,
        startDate,
        endDate,
        getColumn(type),
        getTable(type),
        {
          domain: type !== 'event' && domain,
          url: type !== 'url' && url,
        },
      );

      return ok(res, data);
    }
  }

  return methodNotAllowed(res);
};
