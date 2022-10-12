import moment from 'moment-timezone';
import { getPageviewStats } from 'queries';
import { ok, badRequest, methodNotAllowed, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';

const unitTypes = ['year', 'month', 'hour', 'day'];

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const {
      id: websiteId,
      start_at,
      end_at,
      unit,
      tz,
      url,
      referrer,
      os,
      browser,
      device,
      country,
    } = req.query;

    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    if (!moment.tz.zone(tz) || !unitTypes.includes(unit)) {
      return badRequest(res);
    }

    const [pageviews, sessions] = await Promise.all([
      getPageviewStats(websiteId, {
        start_at: startDate,
        end_at: endDate,
        timezone: tz,
        unit,
        count: '*',
        filters: {
          url,
          referrer,
          os,
          browser,
          device,
          country,
        },
      }),
      getPageviewStats(websiteId, {
        start_at: startDate,
        end_at: endDate,
        timezone: tz,
        unit,
        count: 'distinct pageview.',
        filters: {
          url,
          os,
          browser,
          device,
          country,
        },
      }),
    ]);

    return ok(res, { pageviews, sessions });
  }

  return methodNotAllowed(res);
};
