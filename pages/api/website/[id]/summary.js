import { getSummary } from 'lib/db';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  const { id, start_at, end_at } = req.query;

  const summary = await getSummary(
    +id,
    new Date(+start_at).toISOString(),
    new Date(+end_at).toISOString(),
  );

  const stats = Object.keys(summary[0]).reduce((obj, key) => {
    obj[key] = +summary[0][key];
    return obj;
  }, {});

  return res.status(200).json(stats);
};
