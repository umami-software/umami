import { subMinutes } from 'date-fns';
import { ok, methodNotAllowed, createToken } from 'next-basics';
import { useAuth } from 'lib/middleware';
import { getUserWebsites, getRealtimeData } from 'queries';
import { secret } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { user_id } = req.auth;

    const websites = await getUserWebsites(user_id);
    const ids = websites.map(({ website_id }) => website_id);
    const token = createToken({ websites: ids }, secret());
    const data = await getRealtimeData(ids, subMinutes(new Date(), 30));

    return ok(res, {
      websites,
      token,
      data,
    });
  }

  return methodNotAllowed(res);
};
