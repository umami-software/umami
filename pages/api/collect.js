import { savePageView, saveEvent } from 'lib/db';
import { useCors, useSession } from 'lib/middleware';
import { createToken } from 'lib/crypto';

export default async (req, res) => {
  await useCors(req, res);
  await useSession(req, res);

  const { session } = req;
  const token = await createToken(session);
  const { website_id, session_id } = session;
  const { type, payload } = req.body;
  let ok = false;

  if (type === 'pageview') {
    const { url, referrer } = payload;

    await savePageView(website_id, session_id, url, referrer);

    ok = true;
  } else if (type === 'event') {
    const { url, event_type, event_value } = payload;

    await saveEvent(website_id, session_id, url, event_type, event_value);

    ok = true;
  }

  res.status(200).json({ ok, session: token });
};
