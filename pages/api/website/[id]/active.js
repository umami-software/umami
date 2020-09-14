import { getActiveVisitors } from 'lib/queries';
import { methodNotAllowed, ok } from 'lib/response';
import { useAuth } from 'lib/middleware';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { id } = req.query;
    const website_id = +id;

    const result = await getActiveVisitors(website_id);

    return ok(res, result);
  }

  return methodNotAllowed(res);
};
