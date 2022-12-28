import { getWebsiteStats } from 'queries';
import { methodNotAllowed, ok, unauthorized } from 'next-basics';
import { allowQuery } from 'lib/auth';
import { useAuth, useCors } from 'lib/middleware';
import { TYPE_WEBSITE } from 'lib/constants';

export default async (req, res) => {
  await useCors(req, res);
  await useAuth(req, res);

  if (req.method === 'GET') {
    if (!(await allowQuery(req, TYPE_WEBSITE))) {
      return unauthorized(res);
    }

    const {
      id: websiteId,
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

    const distance = end_at - start_at;
    const prevStartDate = new Date(+start_at - distance);
    const prevEndDate = new Date(+end_at - distance);

    const metrics = await getWebsiteStats(websiteId, {
      start_at: startDate,
      end_at: endDate,
      filters: {
        url,
        referrer,
        os,
        browser,
        device,
        country,
      },
    });
    const prevPeriod = await getWebsiteStats(websiteId, {
      start_at: prevStartDate,
      end_at: prevEndDate,
      filters: {
        url,
        referrer,
        os,
        browser,
        device,
        country,
      },
    });

    const stats = Object.keys(metrics[0]).reduce((obj, key) => {
      obj[key] = {
        value: Number(metrics[0][key]) || 0,
        change: Number(metrics[0][key]) - Number(prevPeriod[0][key]) || 0,
      };
      return obj;
    }, {});

    return ok(res, stats);
  }

  return methodNotAllowed(res);
};
