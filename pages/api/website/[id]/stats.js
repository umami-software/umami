import { getWebsiteStats } from 'lib/queries';
import { methodNotAllowed, ok, unauthorized } from 'lib/response';
import { allowQuery } from 'lib/auth';

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!(await allowQuery(req))) {
      return unauthorized(res);
    }

    const { id, start_at, end_at, url } = req.query;

    const websiteId = +id;
    const startDate = new Date(+start_at);
    const endDate = new Date(+end_at);

    const metrics = await getWebsiteStats(websiteId, startDate, endDate, { url });

    const stats = Object.keys(metrics[0]).reduce((obj, key) => {
      obj[key] = Number(metrics[0][key]) || 0;
      return obj;
    }, {});

    return ok(res, stats);
  }

  return methodNotAllowed(res);
};
