import { ok, methodNotAllowed, badRequest, parseToken } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { getRealtimeData } from 'queries';
import { SHARE_TOKEN_HEADER } from 'lib/constants';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { start_at } = req.query;

    const token = req.headers[SHARE_TOKEN_HEADER];

    if (!token) {
      return badRequest(res);
    }

    const { websites } = parseToken(token, secret());

    const data = await getRealtimeData(websites, new Date(+start_at));

    return ok(res, data);
  }

  return methodNotAllowed(res);
};
