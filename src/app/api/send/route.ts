import { startOfHour } from 'date-fns';
import { isbot } from 'isbot';
import clickhouse from '@/lib/clickhouse';
import { CACHE_TOKEN_TYPE, COLLECTION_TYPE, EVENT_TYPE, FIELD_LENGTH } from '@/lib/constants';
import { getSalt, hash, secret, uuid } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { truncateString } from '@/lib/format';
import { createToken, parseToken } from '@/lib/jwt';
import { fetchWebsite } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json, serverError } from '@/lib/response';
import { safeDecodeURI, safeDecodeURIComponent } from '@/lib/url';
import {
  createSession,
  saveEngagement,
  saveEvent,
  saveSessionData,
  saveSessionLink,
  updateSession,
} from '@/queries/sql';
import { collectionSchema } from './request-schema';

interface Cache {
  websiteId: string;
  sessionId: string;
  visitId: string;
  iat: number;
  sessionLinkId?: string;
}

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, collectionSchema, { skipAuth: true });

    if (error) {
      return error();
    }

    const { type, payload } = body;

    const {
      website: websiteId,
      pixel: pixelId,
      link: linkId,
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
      id,
      lcp,
      inp,
      cls,
      fcp,
      ttfb,
      engagement,
    } = payload;

    const sourceId = websiteId || pixelId || linkId;

    // Cache check
    let cache: Cache | null = null;

    if (websiteId) {
      const cacheHeader = request.headers.get('x-umami-cache');

      if (cacheHeader) {
        const result = await parseToken(cacheHeader, secret());

        if (result?.type === CACHE_TOKEN_TYPE) {
          cache = result;
        }
      }

      // Find website
      if (!cache?.websiteId) {
        const website = await fetchWebsite(websiteId);

        if (!website) {
          return badRequest({ message: 'Website not found.' });
        }
      }
    }

    // Carried forward in the cache token so repeat identify calls skip identity writes
    let sessionLinkId = cache?.sessionLinkId;

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

    const createdAt = timestamp !== undefined ? new Date(timestamp * 1000) : new Date();
    const now = Math.floor(Date.now() / 1000);
    const distinctId = truncateString(id, FIELD_LENGTH.distinctId);

    const sessionSalt = getSalt(process.env.SALT_ROTATION, createdAt);
    const visitSalt = hash(startOfHour(createdAt).toUTCString());

    // Identified users need a separate deterministic session from anonymous users
    // who happen to share the same IP address and user agent.
    const sessionId = uuid(sourceId, ip, userAgent, sessionSalt, distinctId ?? '');
    const sessionDrift = !!websiteId && !!cache?.sessionId && cache.sessionId !== sessionId;
    const shouldEnsureSession = !clickhouse.enabled && sessionDrift;

    // Create a session if not found
    if ((!clickhouse.enabled && !cache?.sessionId) || shouldEnsureSession) {
      await createSession({
        id: sessionId,
        websiteId: sourceId,
        browser,
        os,
        device,
        screen,
        language,
        country,
        region,
        city,
        distinctId,
        createdAt,
      });
    }

    // Visit info
    let visitId = cache?.visitId || uuid(sessionId, visitSalt);
    let iat = cache?.iat || now;

    // A drifted cache session should start a fresh visit on the recomputed session.
    if (sessionDrift) {
      visitId = uuid(sessionId, visitSalt);
      iat = now;
    }

    // Expire visit after 30 minutes. Engagement is reported for the page the
    // visitor is leaving, so it stays with the visit that page belongs to.
    if (timestamp === undefined && now - iat > 1800 && type !== COLLECTION_TYPE.engagement) {
      visitId = uuid(sessionId, visitSalt);
      iat = now;
    }

    if (type === COLLECTION_TYPE.event) {
      const base = hostname ? `https://${hostname}` : 'https://localhost';
      const currentUrl = new URL(url, base);

      let urlPath =
        currentUrl.pathname === '/undefined' ? '' : currentUrl.pathname + currentUrl.hash;
      const urlQuery = currentUrl.search.substring(1);
      const urlDomain = currentUrl.hostname.replace(/^www\./, '');

      let referrerPath: string;
      let referrerQuery: string;
      let referrerDomain: string;

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
        // Never strip the root slash, otherwise the home page is saved with an empty path
        urlPath = urlPath.replace(/(?!^)\/(?=(#.*)?$)/, '');
      }

      if (referrer) {
        // Canonicalize the event domain (lowercase, punycode, no port) so it
        // compares correctly against the parsed referrer hostname
        let eventDomain = urlDomain;
        if (hostname) {
          try {
            eventDomain = new URL(`https://${hostname}`).hostname.replace(/^www\./, '');
          } catch {
            eventDomain = hostname.replace(/^www\./, '');
          }
        }
        // Resolve path-only referrers against the event's domain, not the localhost fallback
        const referrerUrl = new URL(referrer, eventDomain ? `https://${eventDomain}` : base);

        referrerPath = referrerUrl.pathname;
        referrerQuery = referrerUrl.search.substring(1);
        referrerDomain = referrerUrl.hostname.replace(/^www\./, '');

        // Never save the referrer domain for self-referrals
        if (referrerDomain === eventDomain) {
          referrerDomain = undefined;
        }
      }

      const eventType = linkId
        ? EVENT_TYPE.linkEvent
        : pixelId
          ? EVENT_TYPE.pixelEvent
          : name
            ? EVENT_TYPE.customEvent
            : EVENT_TYPE.pageView;

      await saveEvent({
        websiteId: sourceId,
        sessionId,
        visitId,
        eventType,
        createdAt,

        // Page
        pageTitle: safeDecodeURIComponent(title),
        hostname: hostname || urlDomain,
        urlPath: safeDecodeURI(urlPath),
        urlQuery,
        referrerPath: safeDecodeURI(referrerPath),
        referrerQuery,
        referrerDomain,

        // Session
        distinctId,
        browser,
        os,
        device,
        screen,
        language,
        country,
        region,
        city,

        // Events
        eventName: name,
        eventData: data,
        tag,

        // UTM
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,

        // Click IDs
        gclid,
        fbclid,
        msclkid,
        ttclid,
        lifatid,
        twclid,
      });
    } else if (type === COLLECTION_TYPE.identify) {
      if (websiteId && distinctId) {
        const newLinkId = hash(sessionId, distinctId);

        if (sessionLinkId !== newLinkId) {
          // Best-effort: identity link failures must not block the session data write below.
          try {
            await Promise.all([
              saveSessionLink({
                websiteId,
                sessionId,
                distinctId,
                createdAt,
              }),
              updateSession({
                websiteId,
                sessionId,
                distinctId,
              }),
            ]);
            sessionLinkId = newLinkId;
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to save session link:', e);
          }
        }
      }

      if (data) {
        await saveSessionData({
          websiteId,
          sessionId,
          sessionData: data,
          distinctId,
          createdAt,
        });
      }
    } else if (type === COLLECTION_TYPE.performance) {
      const base = hostname ? `https://${hostname}` : 'https://localhost';
      const currentUrl = new URL(url, base);
      const urlPath = currentUrl.pathname === '/undefined' ? '' : currentUrl.pathname;

      await saveEvent({
        websiteId: sourceId,
        sessionId,
        visitId,
        urlPath,
        pageTitle: safeDecodeURIComponent(title),
        eventType: EVENT_TYPE.performance,
        browser,
        os,
        device,
        screen,
        language,
        country,
        region,
        city,
        lcp,
        inp,
        cls,
        fcp,
        ttfb,
        createdAt,
      });
    } else if (type === COLLECTION_TYPE.engagement) {
      if (websiteId && engagement) {
        const base = hostname ? `https://${hostname}` : 'https://localhost';
        const currentUrl = new URL(url, base);
        const urlPath = currentUrl.pathname === '/undefined' ? '' : currentUrl.pathname;

        await saveEngagement({
          websiteId,
          sessionId,
          visitId,
          urlPath: safeDecodeURI(urlPath),
          engagementTime: engagement,
          createdAt,
        });
      }
    }

    const token = createToken(
      { websiteId, sessionId, visitId, iat, sessionLinkId, type: CACHE_TOKEN_TYPE },
      secret(),
    );

    return json({ cache: token, sessionId, visitId });
  } catch (e) {
    return serverError(e);
  }
}
