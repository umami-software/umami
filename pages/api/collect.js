import { savePageView, saveEvent } from 'lib/queries';
import { useCors, useSession } from 'lib/middleware';
import { ok, badRequest } from 'lib/response';
import isBot from 'isbot-fast';

export default async (req, res) => {
  if (isBot(req.headers['user-agent'])) {
    return ok(res);
  }

  await useCors(req, res);
  await useSession(req, res);

  const { type, payload } = req.body;
  const {
    session: { website_id, session_id },
  } = req;

  if (type === 'pageview') {
    const { url, referrer } = payload;

    await savePageView(website_id, session_id, url, referrer);
  } else if (type === 'event') {
    const { url, event_type, event_value } = payload;

    await saveEvent(website_id, session_id, url, event_type, event_value);
  } else {
    return badRequest(res);
  }

  return ok(res);
};
