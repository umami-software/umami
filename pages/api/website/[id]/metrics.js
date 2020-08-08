import { getMetrics } from 'lib/db';
import { useAuth } from 'lib/middleware';
import { ok } from 'lib/response';

export default async (req, res) => {
  await useAuth(req, res);

  const { id, start_at, end_at } = req.query;

  const metrics = await getMetrics(
    +id,
    new Date(+start_at).toISOString(),
    new Date(+end_at).toISOString(),
  );

  const stats = Object.keys(metrics[0]).reduce((obj, key) => {
    obj[key] = +metrics[0][key];
    return obj;
  }, {});

  return ok(res, stats);
};
