import { getWebsiteStats } from 'queries';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';
import { useCors } from 'lib/middleware';

export default async (req, res) => {
  if (req.method === 'GET') {
    await useCors(req, res);

    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, url, referrer, os, browser, device, country } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const distance = end_at - start_at;
    const prevStartDate = new Date(+start_at - distance);
    const prevEndDate = new Date(+end_at - distance);

    const metrics = await getWebsiteStats(websiteId, startDate, endDate, {
      url,
      referrer,
      os,
      browser,
      device,
      country,
    });
    const prevPeriod = await getWebsiteStats(websiteId, prevStartDate, prevEndDate, {
      url,
      referrer,
      os,
      browser,
      device,
      country,
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
