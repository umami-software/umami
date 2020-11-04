import { subMinutes } from 'date-fns';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed } from 'lib/response';
import { getUserWebsites, getRealtimeData } from 'lib/queries';
import { createToken } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  if (req.method === 'GET') {
    const { user_id } = req.auth;

    const websites = await getUserWebsites(user_id);
    const ids = websites.map(({ website_id }) => website_id);
    const token = await createToken({ websites: ids });
    const data = await getRealtimeData(ids, subMinutes(new Date(), 30));

    return ok(res, {
      websites,
      token,
      data,
    });
  }

  return methodNotAllowed(res);
};
