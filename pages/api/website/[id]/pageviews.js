import moment from 'moment-timezone';
import { getPageviewStats } from 'queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';
import { useCors } from 'lib/middleware';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, unit, tz, url, referrer, os, browser, device, country } =
      req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const [pageviews, sessions] = await Promise.all([
      getPageviewStats(websiteId, startDate, endDate, tz, unit, '*', {
        url,
        referrer,
        os,
        browser,
        device,
        country,
      }),
      getPageviewStats(websiteId, startDate, endDate, tz, unit, 'distinct pageview.', {
        url,
        os,
        browser,
        device,
        country,
      }),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
