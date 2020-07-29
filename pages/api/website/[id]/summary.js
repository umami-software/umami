import { getSummary } from 'lib/db';
import { useAuth } from 'lib/middleware';
import { format } from 'date-fns';

export default async (req, res) => {
  await useAuth(req, res);

  const { id, start_at, end_at } = req.query;

  const summary = await getSummary(
    +id,
    format(new Date(+start_at), 'yyyy-MM-dd hh:mm:ss'),
    format(new Date(+end_at), 'yyyy-MM-dd hh:mm:ss'),
  );

  return res.status(200).json(summary[0]);
};
