import { savePageView, saveEvent } from 'lib/queries';
import { useCors, useSession } from 'lib/middleware';
import { createToken } from 'lib/crypto';
import { ok, badRequest } from 'lib/response';

export default async (req, res) => {
  await useCors(req, res);
  await useSession(req, res);

  const { session } = req;
  const token = await createToken(session);
  const { website_id, session_id } = session;
  const { type, payload } = req.body;

  if (type === 'pageview') {
    const { url, referrer } = payload;

    await savePageView(website_id, session_id, url, referrer);
  } else if (type === 'event') {
    const { url, event_type, event_value } = payload;

    await saveEvent(website_id, session_id, url, event_type, event_value);
  } else {
    return badRequest(res);
  }

  return ok(res, { session: token });
};
