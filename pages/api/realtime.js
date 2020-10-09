import { subMinutes } from 'date-fns';
import { useAuth } from 'lib/middleware';
import { ok, methodNotAllowed, badRequest } from 'lib/response';
import { getEvents, getPageviews, getSessions, getUserWebsites } from 'lib/queries';
import { createToken, parseToken } from 'lib/crypto';

export default async (req, res) => {
  await useAuth(req, res);

  async function getData(websites, time) {
    const [pageviews, sessions, events] = await Promise.all([
      getPageviews(websites, time),
      getSessions(websites, time),
      getEvents(websites, time),
    ]);

    return {
      pageviews: pageviews.map(({ view_id, ...props }) => ({
        __id: `p${view_id}`,
        view_id,
        ...props,
      })),
      sessions: sessions.map(({ session_id, ...props }) => ({
        __id: `s${session_id}`,
        session_id,
        ...props,
      })),
      events: events.map(({ event_id, ...props }) => ({
        __id: `e${event_id}`,
        event_id,
        ...props,
      })),
      timestamp: Date.now(),
    };
  }

  if (req.method === 'GET') {
    const { type, start_at } = req.query;
    const { user_id } = req.auth;

    if (type === 'init') {
      const websites = await getUserWebsites(user_id);
      const ids = websites.map(({ website_id }) => website_id);
      const token = await createToken({ websites: ids });
      const data = await getData(ids, subMinutes(new Date(), 30));

      return ok(res, {
        websites,
        token,
        data,
      });
    }

    if (type === 'update') {
      const token = req.headers['x-umami-token'];

      if (!token) {
        return badRequest(res);
      }

      const { websites } = await parseToken(token);

      const data = await getData(websites, new Date(+start_at));

      return ok(res, data);
    }

    return badRequest(res);
  }

  return methodNotAllowed(res);
};
