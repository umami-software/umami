import { z } from 'zod';
import { isbot } from 'isbot';
import { startOfHour, startOfMonth } from 'date-fns';
import clickhouse from '@/lib/clickhouse';
import { parseRequest } from '@/lib/request';
import { badRequest, json, forbidden, serverError } from '@/lib/response';
import { fetchSession, fetchWebsite } from '@/lib/load';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { createToken, parseToken } from '@/lib/jwt';
import { secret, uuid, hash } from '@/lib/crypto';
import { COLLECTION_TYPE } from '@/lib/constants';
import { anyObjectParam, urlOrPathParam } from '@/lib/schema';
import { safeDecodeURI, safeDecodeURIComponent } from '@/lib/url';
import { createSession, saveEvent, saveSessionData } from '@/queries';

const schema = z.object({
  type: z.enum(['event', 'identify']),
  payload: z.object({
    website: z.string().uuid(),
    data: anyObjectParam.optional(),
    hostname: z.string().max(100).optional(),
    language: z.string().max(35).optional(),
    referrer: urlOrPathParam.optional(),
    screen: z.string().max(11).optional(),
    title: z.string().optional(),
    url: urlOrPathParam.optional(),
    name: z.string().max(50).optional(),
    tag: z.string().max(50).optional(),
    ip: z.string().ip().optional(),
    userAgent: z.string().optional(),
    timestamp: z.coerce.number().int().optional(),
    id: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, schema, { skipAuth: true });

    if (error) {
      return error();
    }

    const { type, payload } = body;

    const {
      website: websiteId,
      hostname,
      screen,
      language,
      url,
      referrer,
      name,
      data,
      title,
      tag,
      timestamp,
      id = '',
    } = payload;

    // Cache check
    let cache: { websiteId: string; sessionId: string; visitId: string; iat: number } | null = null;
    const cacheHeader = request.headers.get('x-umami-cache');

    if (cacheHeader) {
      const result = await parseToken(cacheHeader, secret());

      if (result) {
        cache = result;
      }
    }

    // Find website
    if (!cache?.websiteId) {
      const website = await fetchWebsite(websiteId);

      if (!website) {
        return badRequest('Website not found.');
      }
    }

    // Client info
    const { ip, userAgent, device, browser, os, country, region, city } = await getClientInfo(
      request,
      payload,
    );

    // Bot check
    if (!process.env.DISABLE_BOT_CHECK && isbot(userAgent)) {
      return json({ beep: 'boop' });
    }

    // IP block
    if (hasBlockedIp(ip)) {
      return forbidden();
    }

    const createdAt = timestamp ? new Date(timestamp * 1000) : new Date();
    const now = Math.floor(new Date().getTime() / 1000);

    const sessionSalt = hash(startOfMonth(createdAt).toUTCString());
    const visitSalt = hash(startOfHour(createdAt).toUTCString());

    const sessionId = uuid(websiteId, ip, userAgent, sessionSalt, id);

    // Find session
    if (!clickhouse.enabled && !cache?.sessionId) {
      const session = await fetchSession(websiteId, sessionId);

      // Create a session if not found
      if (!session) {
        try {
          await createSession({
            id: sessionId,
            websiteId,
            browser,
            os,
            device,
            screen,
            language,
            country,
            region,
            city,
          });
        } catch (e: any) {
          if (!e.message.toLowerCase().includes('unique constraint')) {
            return serverError(e);
          }
        }
      }
    }

    // Visit info
    let visitId = cache?.visitId || uuid(sessionId, visitSalt);
    let iat = cache?.iat || now;

    // Expire visit after 30 minutes
    if (!timestamp && now - iat > 1800) {
      visitId = uuid(sessionId, visitSalt);
      iat = now;
    }

    if (type === COLLECTION_TYPE.event) {
      const base = hostname ? `https://${hostname}` : 'https://localhost';
      const currentUrl = new URL(url, base);

      let urlPath = currentUrl.pathname;
      const urlQuery = currentUrl.search.substring(1);
      const urlDomain = currentUrl.hostname.replace(/^www./, '');

      // UTM Params
      const utmSource = currentUrl.searchParams.get('utm_source');
      const utmMedium = currentUrl.searchParams.get('utm_medium');
      const utmCampaign = currentUrl.searchParams.get('utm_campaign');
      const utmContent = currentUrl.searchParams.get('utm_content');
      const utmTerm = currentUrl.searchParams.get('utm_term');

      // Click IDs
      const gclid = currentUrl.searchParams.get('gclid');
      const fbclid = currentUrl.searchParams.get('fbclid');
      const msclkid = currentUrl.searchParams.get('msclkid');
      const ttclid = currentUrl.searchParams.get('ttclid');
      const lifatid = currentUrl.searchParams.get('li_fat_id');
      const twclid = currentUrl.searchParams.get('twclid');

      if (process.env.REMOVE_TRAILING_SLASH) {
        urlPath = urlPath.replace(/(.+)\/$/, '$1');
      }

      urlPath = urlPath + currentUrl.hash;

      let referrerPath: string;
      let referrerQuery: string;
      let referrerDomain: string;

      if (referrer) {
        const referrerUrl = new URL(referrer, base);

        referrerPath = referrerUrl.pathname;
        referrerQuery = referrerUrl.search.substring(1);

        if (referrerUrl.hostname !== 'localhost') {
          referrerDomain = referrerUrl.hostname.replace(/^www\./, '');
        }
      }

      await saveEvent({
        websiteId,
        sessionId,
        visitId,
        urlPath: safeDecodeURI(urlPath),
        urlQuery,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        referrerPath: safeDecodeURI(referrerPath),
        referrerQuery,
        referrerDomain,
        pageTitle: safeDecodeURIComponent(title),
        gclid,
        fbclid,
        msclkid,
        ttclid,
        lifatid,
        twclid,
        eventName: name,
        eventData: data,
        hostname: hostname || urlDomain,
        browser,
        os,
        device,
        screen,
        language,
        country,
        region,
        city,
        tag,
        createdAt,
      });
    }

    if (type === COLLECTION_TYPE.identify) {
      if (!data) {
        return badRequest('Data required.');
      }

      await saveSessionData({
        websiteId,
        sessionId,
        sessionData: data,
        createdAt,
      });
    }

    const token = createToken({ websiteId, sessionId, visitId, iat }, secret());

    return json({ cache: token, sessionId, visitId });
  } catch (e) {
    return serverError(e);
  }
}
