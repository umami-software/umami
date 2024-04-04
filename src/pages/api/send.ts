import ipaddr from 'ipaddr.js';
import { isbot } from 'isbot';
import { COLLECTION_TYPE, HOSTNAME_REGEX, IP_REGEX } from 'lib/constants';
import { secret, visitSalt, uuid } from 'lib/crypto';
import { getIpAddress } from 'lib/detect';
import { useCors, useSession, useValidate } from 'lib/middleware';
import { CollectionType, YupRequest } from 'lib/types';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  badRequest,
  createToken,
  forbidden,
  methodNotAllowed,
  ok,
  safeDecodeURI,
  send,
} from 'next-basics';
import { saveEvent, saveSessionData } from 'queries';
import * as yup from 'yup';

export interface CollectRequestBody {
  payload: {
    website: string;
    data?: { [key: string]: any };
    hostname?: string;
    ip?: string;
    language?: string;
    name?: string;
    referrer?: string;
    screen?: string;
    tag?: string;
    title?: string;
    url: string;
  };
  type: CollectionType;
}

export interface NextApiRequestCollect extends NextApiRequest {
  body: CollectRequestBody;
  session: {
    id: string;
    websiteId: string;
    visitId: string;
    ownerId: string;
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
    iat: number;
  };
  headers: { [key: string]: any };
  yup: YupRequest;
}

const schema = {
  POST: yup.object().shape({
    payload: yup
      .object()
      .shape({
        data: yup.object(),
        hostname: yup.string().matches(HOSTNAME_REGEX).max(100),
        ip: yup.string().matches(IP_REGEX),
        language: yup.string().max(35),
        referrer: yup.string(),
        screen: yup.string().max(11),
        title: yup.string(),
        url: yup.string(),
        website: yup.string().uuid().required(),
        name: yup.string().max(50),
        tag: yup.string().max(50).nullable(),
      })
      .required(),
    type: yup
      .string()
      .matches(/event|identify/i)
      .required(),
  }),
};

export default async (req: NextApiRequestCollect, res: NextApiResponse) => {
  await useCors(req, res);

  if (req.method === 'POST') {
    if (!process.env.DISABLE_BOT_CHECK && isbot(req.headers['user-agent'])) {
      return ok(res);
    }

    await useValidate(schema, req, res);

    if (hasBlockedIp(req)) {
      return forbidden(res);
    }

    const { type, payload } = req.body;
    const { url, referrer, name: eventName, data, title } = payload;
    const pageTitle = safeDecodeURI(title);

    await useSession(req, res);

    const session = req.session;

    // expire visitId after 30 minutes
    session.visitId =
      !!session.iat && Math.floor(new Date().getTime() / 1000) - session.iat > 1800
        ? uuid(session.id, visitSalt())
        : session.visitId;

    session.iat = Math.floor(new Date().getTime() / 1000);

    if (type === COLLECTION_TYPE.event) {
      // eslint-disable-next-line prefer-const
      let [urlPath, urlQuery] = safeDecodeURI(url)?.split('?') || [];
      let [referrerPath, referrerQuery] = safeDecodeURI(referrer)?.split('?') || [];
      let referrerDomain = '';

      if (!urlPath) {
        urlPath = '/';
      }

      if (referrerPath?.startsWith('http')) {
        const refUrl = new URL(referrer);
        referrerPath = refUrl.pathname;
        referrerQuery = refUrl.search.substring(1);
        referrerDomain = refUrl.hostname.replace(/www\./, '');
      }

      if (process.env.REMOVE_TRAILING_SLASH) {
        urlPath = urlPath.replace(/(.+)\/$/, '$1');
      }

      await saveEvent({
        urlPath,
        urlQuery,
        referrerPath,
        referrerQuery,
        referrerDomain,
        pageTitle,
        eventName,
        eventData: data,
        ...session,
        sessionId: session.id,
        visitId: session.visitId,
      });
    }

    if (type === COLLECTION_TYPE.identify) {
      if (!data) {
        return badRequest(res, 'Data required.');
      }

      await saveSessionData({
        websiteId: session.websiteId,
        sessionId: session.id,
        sessionData: data,
      });
    }

    const token = createToken(session, secret());

    return send(res, token);
  }

  return methodNotAllowed(res);
};

function hasBlockedIp(req: NextApiRequestCollect) {
  const ignoreIps = process.env.IGNORE_IP;

  if (ignoreIps) {
    const ips = [];

    if (ignoreIps) {
      ips.push(...ignoreIps.split(',').map(n => n.trim()));
    }

    const clientIp = getIpAddress(req);

    return ips.find(ip => {
      if (ip === clientIp) return true;

      // CIDR notation
      if (ip.indexOf('/') > 0) {
        const addr = ipaddr.parse(clientIp);
        const range = ipaddr.parseCIDR(ip);

        if (addr.kind() === range[0].kind() && addr.match(range)) return true;
      }
    });
  }

  return false;
}
