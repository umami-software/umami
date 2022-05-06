import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed, badRequest } from 'lib/response';
import { getRealtimeData } from 'lib/queries';
import { parseToken } from 'lib/crypto';
import { SHARE_TOKEN_HEADER } from 'lib/constants';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { start_at } = req.query;

    const token = req.headers[SHARE_TOKEN_HEADER];

    if (!token) {
      return badRequest(res);
    }

    const { websites } = await parseToken(token);

    const data = await getRealtimeData(websites, new Date(+start_at));

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
