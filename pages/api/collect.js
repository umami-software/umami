const { Resolver } = require('dns').promises;
import isbot from 'isbot';
import ipaddr from 'ipaddr.js';
import { createToken, ok, send, badRequest, forbidden } from 'next-basics';
import { savePageView, saveEvent } from 'queries';
import { useCors, useSession } from 'lib/middleware';
import { getJsonBody, getIpAddress } from 'lib/request';
import { secret, uuid } from 'lib/crypto';

export default async (req, res) => {
  await useCors(req, res);

  if (isbot(req.headers['user-agent']) && !process.env.DISABLE_BOT_CHECK) {
    return ok(res);
  }

  const ignoreIps = process.env.IGNORE_IP;
  const ignoreHostnames = process.env.IGNORE_HOSTNAME;

  if (ignoreIps || ignoreHostnames) {
    const ips = [];

    if (ignoreIps) {
      ips.push(...ignoreIps.split(',').map(n => n.trim()));
    }

    if (ignoreHostnames) {
      const resolver = new Resolver();
      const promises = ignoreHostnames
        .split(',')
        .map(n => resolver.resolve4(n.trim()).catch(() => {}));

      await Promise.all(promises).then(resolvedIps => {
        ips.push(...resolvedIps.filter(n => n).flatMap(n => n));
      });
    }

    const clientIp = getIpAddress(req);

    const blocked = ips.find(ip => {
      if (ip === clientIp) return true;

      // CIDR notation
      if (ip.indexOf('/') > 0) {
        const addr = ipaddr.parse(clientIp);
        const range = ipaddr.parseCIDR(ip);

        if (addr.kind() === range[0].kind() && addr.match(range)) return true;
      }

      return false;
    });

    if (blocked) {
      return forbidden(res);
    }
  }

  await useSession(req, res);

  const { website, session } = req.session;

  const { type, payload } = getJsonBody(req);

  let { url, referrer, event_name: eventName, event_data: eventData } = payload;

  if (process.env.REMOVE_TRAILING_SLASH) {
    url = url.replace(/\/$/, '');
  }

  const eventUuid = uuid();

  if (type === 'pageview') {
    await savePageView(website, { session, url, referrer });
  } else if (type === 'event') {
    await saveEvent(website, {
      session,
      eventUuid,
      url,
      eventName,
      eventData,
    });
  } else {
    return badRequest(res);
  }

  const token = createToken(
    {
      website,
      session,
    },
    secret(),
  );

  return send(res, token);
};
