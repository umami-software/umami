import { getMetrics } from 'lib/queries';
import { ok } from 'lib/response';

export default async (req, res) => {
  const { id, start_at, end_at } = req.query;
  const websiteId = +id;
  const startDate = new Date(+start_at);
  const endDate = new Date(+end_at);

  const metrics = await getMetrics(websiteId, startDate, endDate);

  const stats = Object.keys(metrics[0]).reduce((obj, key) => {
    obj[key] = Number(metrics[0][key]) || 0;
    return obj;
  }, {});

  return ok(res, stats);
};
