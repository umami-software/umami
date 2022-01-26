import isbot from 'isbot';
import ipaddr from 'ipaddr.js';
import { savePageView, saveEvent } from 'lib/queries';
import { useCors, useSession } from 'lib/middleware';
import { getIpAddress } from 'lib/request';
import { ok, badRequest } from 'lib/response';
import { createToken } from 'lib/crypto';
import { removeTrailingSlash } from 'lib/url';

export default async (req, res) => {
  await useCors(req, res);

  if (isbot(req.headers['user-agent'])) {
    return ok(res);
  }

  if (process.env.IGNORE_IP) {
    const ips = process.env.IGNORE_IP.split(',').map(n => n.trim());
    const ip = getIpAddress(req);
    const blocked = ips.find(i => {
      if (i === ip) return true;

      // CIDR notation
      if (i.indexOf('/') > 0) {
        const addr = ipaddr.parse(ip);
        const range = ipaddr.parseCIDR(i);

        if (addr.kind() === range[0].kind() && addr.match(range)) return true;
      }

      return false;
    });

    if (blocked) {
      return ok(res);
    }
  }

  await useSession(req, res);

  const {
    body: { type, payload },
    session: { website_id, session_id },
  } = req;

  let { url, referrer, event_type, event_value } = payload;

  if (process.env.REMOVE_TRAILING_SLASH) {
    url = removeTrailingSlash(url);
  }

  if (type === 'pageview') {
    await savePageView(website_id, session_id, url, referrer);
  } else if (type === 'event') {
    await saveEvent(website_id, session_id, url, event_type, event_value);
  } else {
    return badRequest(res);
  }

  const token = await createToken({ website_id, session_id });

  return ok(res, token);
};
