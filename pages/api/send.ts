import isbot from 'isbot';
import ipaddr from 'ipaddr.js';
import { createToken, ok, send, badRequest, forbidden } from 'next-basics';
import { savePageView, saveEvent } from 'queries';
import { useCors, useSession } from 'lib/middleware';
import { getJsonBody, getIpAddress } from 'lib/detect';
import { secret } from 'lib/crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { Resolver } from 'dns/promises';

export interface NextApiRequestCollect extends NextApiRequest {
  session: {
    id: string;
    websiteId: string;
    hostname: string;
    browser: string;
    os: string;
    device: string;
    screen: string;
    language: string;
    country: string;
    subdivision1: string;
    subdivision2: string;
    city: string;
  };
}

export default async (req: NextApiRequestCollect, res: NextApiResponse) => {
  await useCors(req, res);

  if (isbot(req.headers['user-agent']) && !process.env.DISABLE_BOT_CHECK) {
    return ok(res);
  }

  const { type, payload } = getJsonBody(req);

  const { url, referrer, eventName, eventData, pageTitle } = payload;

  // Validate eventData is JSON
  if (eventData && !(typeof eventData === 'object' && !Array.isArray(eventData))) {
    return badRequest(res, 'Event Data must be in the form of a JSON Object.');
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
        ips.push(...resolvedIps.filter(n => n).flatMap(n => n as string[]));
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

  const session = req.session;

  let urlPath = url.split('?')[0];
  const urlQuery = url.split('?')[1];
  let referrerPath;
  let referrerQuery;
  let referrerDomain;

  try {
    const newRef = new URL(referrer);
    referrerPath = newRef.pathname;
    referrerDomain = newRef.hostname;
    referrerQuery = newRef.search.substring(1);
  } catch {
    referrerPath = referrer?.split('?')[0];
    referrerQuery = referrer?.split('?')[1];
  }

  if (process.env.REMOVE_TRAILING_SLASH) {
    urlPath = urlPath.replace(/\/$/, '');
  }

  if (type === 'pageview') {
    await savePageView({
      ...session,
      urlPath,
      urlQuery,
      referrerPath,
      referrerQuery,
      referrerDomain,
      pageTitle,
    });
  } else if (type === 'event') {
    await saveEvent({
      ...session,
      urlPath,
      urlQuery,
      pageTitle,
      eventName,
      eventData,
    });
  } else {
    return badRequest(res);
  }

  const token = createToken(session, secret());

  return send(res, token);
};
