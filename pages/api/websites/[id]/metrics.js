import { allowQuery } from 'lib/auth';
import { FILTER_IGNORED } from 'lib/constants';
import { useAuth, useCors } from 'lib/middleware';
import { badRequest, methodNotAllowed, ok, unauthorized } from 'next-basics';
import { getPageviewMetrics, getSessionMetrics, getWebsiteByUuid } from 'queries';

const sessionColumns = ['browser', 'os', 'device', 'screen', 'country', 'language'];
const pageviewColumns = ['url', 'referrer', 'query'];

function getTable(type) {
  if (type === 'event') {
    return 'event';
  }

  if (sessionColumns.includes(type)) {
    return 'session';
  }

  if (pageviewColumns.includes(type)) {
    return 'pageview';
  }

  throw new Error('Invalid type');
}

function getColumn(type) {
  if (type === 'event') {
    return 'event_name';
  }
  if (type === 'query') {
    return 'url';
  }
  return type;
}

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const {
      id: websiteId,
      type,
      start_at,
      end_at,
      url,
      referrer,
      os,
      browser,
      device,
      country,
    } = req.query;

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (sessionColumns.includes(type)) {
      let data = await getSessionMetrics(websiteId, {
        startDate,
        endDate,
        field: type,
        filters: {
          os,
          browser,
          device,
          country,
        },
      });

      if (type === 'language') {
        let combined = {};

        for (let { x, y } of data) {
          x = String(x).toLowerCase().split('-')[0];

          if (!combined[x]) {
            combined[x] = { x, y };
          } else {
            combined[x].y += y;
          }
        }

        data = Object.values(combined);
      }

      return ok(res, data);
    }

    if (pageviewColumns.includes(type) || type === 'event') {
      let domain;

      if (type === 'referrer') {
        const website = await getWebsiteByUuid(websiteId);

        if (!website) {
          return badRequest(res);
        }

        domain = website.domain;
      }

      const column = getColumn(type);
      const table = getTable(type);
      const filters = {
        domain,
        url: type !== 'url' && table !== 'event' ? url : undefined,
        referrer: type !== 'referrer' && table !== 'event' ? referrer : FILTER_IGNORED,
        os: type !== 'os' ? os : undefined,
        browser: type !== 'browser' ? browser : undefined,
        device: type !== 'device' ? device : undefined,
        country: type !== 'country' ? country : undefined,
        event_url: type !== 'url' && table === 'event' ? url : undefined,
        query: type === 'query' && table !== 'event' ? true : undefined,
      };

      const data = await getPageviewMetrics(websiteId, {
        startDate,
        endDate,
        column,
        table,
        filters,
      });

      return ok(res, data);
    }
  }

  return methodNotAllowed(res);
};
