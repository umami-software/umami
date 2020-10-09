import { subMinutes } from 'date-fns';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed, badRequest } from 'lib/response';
import { getEvents, getPageviews, getSessions, getUserWebsites } from 'lib/queries';
import { createToken, parseToken } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  async function getData(websites, time) {
    return Promise.all([
      getPageviews(websites, time),
      getSessions(websites, time),
      getEvents(websites, time),
    ]);
  }

  if (req.method === 'GET') {
    const { type, start_at } = req.query;
    const { user_id } = req.auth;

    if (type === 'init') {
      const websites = await getUserWebsites(user_id);
      const ids = websites.map(({ website_id }) => website_id);
      const [pageviews, sessions, events] = await getData(ids, subMinutes(new Date(), 30));
      const token = await createToken({ websites: ids });

      return ok(res, { websites, token, data: { pageviews, sessions, events } });
    }

    if (type === 'update') {
      const token = req.headers['x-umami-token'];

      if (!token) {
        return badRequest(res);
      }

      const { websites } = await parseToken(token);

      const [pageviews, sessions, events] = await getData(websites, new Date(+start_at));

      return ok(res, { pageviews, sessions, events });
    }

    return badRequest(res);
  }

  return methodNotAllowed(res);
};
