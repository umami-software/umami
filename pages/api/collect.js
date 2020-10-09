import isBot from 'isbot-fast';
import { savePageView, saveEvent } from 'lib/queries';
import { useCors, useSession } from 'lib/middleware';
import { ok, badRequest } from 'lib/response';
import { createToken } from 'lib/crypto';
import { getIpAddress } from '../../lib/request';

export default async (req, res) => {
  await useCors(req, res);

  if (isBot(req.headers['user-agent'])) {
    return ok(res);
  }

  if (process.env.IGNORE_IP) {
    const ips = process.env.IGNORE_IP.split(',').map(n => n.trim());
    const ip = getIpAddress(req);

    if (ips.includes(ip)) {
      return ok(res);
    }
  }

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

  const token = await createToken({ website_id, session_id });

  return ok(res, token);
};
