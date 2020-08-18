import { getActiveVisitors } from 'lib/queries';
import { ok } from 'lib/response';

export default async (req, res) => {
  const { id } = req.query;
  const website_id = +id;

  const result = await getActiveVisitors(website_id);

  return ok(res, result);
};
