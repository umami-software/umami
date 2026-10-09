import { isbot } from 'isbot';
import clickhouse from '@/lib/clickhouse';
import { type CollectionCache, resolveCollectionSession } from '@/lib/collection-session';
import { CACHE_TOKEN_TYPE, COLLECTION_TYPE, EVENT_TYPE, FIELD_LENGTH } from '@/lib/constants';
import { hash, secret } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { truncateString } from '@/lib/format';
import { createToken, parseToken } from '@/lib/jwt';
import { fetchWebsite, isWebsiteCollectionBlocked } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json, serverError } from '@/lib/response';
import { safeDecodeURI, safeDecodeURIComponent } from '@/lib/url';
import {
  createSession,
  saveEvent,
  saveSessionData,
  saveSessionLink,
  tryClaimAnonymousSession,
  updateSession,
} from '@/queries/sql';
import { collectionSchema } from './request-schema';

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, collectionSchema, { skipAuth: true });

    if (error) {
      return error();
    }

    const { type, payload } = body;

    if (type === 'error') {
      const { collectError } = await import('@/lib/errors/collect');
      return collectError(request, payload);
    }

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
    } = payload;

    const sourceId = websiteId || pixelId || linkId;

    // Cache check
    let cache: CollectionCache | null = null;

    if (websiteId) {
      const cacheHeader = request.headers.get('x-umami-cache');

      if (cacheHeader) {
        const result = await parseToken(cacheHeader, secret());

        if (result?.type === CACHE_TOKEN_TYPE && result.websiteId === websiteId) {
          cache = result;
        }
      }

      // Fetch even when the client supplied a cache token so account blocks
      // take effect immediately for existing visitors.
      const website = await fetchWebsite(websiteId);

      if (!website) {
        return badRequest({ message: 'Website not found.' });
      }

      if (process.env.CLOUD_MODE && (await isWebsiteCollectionBlocked(website))) {
        return forbidden({ message: 'Collection blocked.' });
      }
    }

    // Carried forward in the cache token so repeat identify calls skip identity writes
    let sessionLinkId = cache?.sessionLinkId;

    // Client info
    const { ip, userAgent, device, browser, os, country, region, city } = await getClientInfo(
      request,
      payload,
    );

    // Global Privacy Control (GPC)
    if (request.headers.get('sec-gpc') === '1') {
      return json({ disabled: true });
    }

    // Bot check
    if (!process.env.DISABLE_BOT_CHECK && isbot(userAgent)) {
      return json({ beep: 'boop' });
    }

    // IP block
    if (hasBlockedIp(ip)) {
      return forbidden();
    }

    const createdAt = timestamp !== undefined ? new Date(timestamp * 1000) : new Date();
    const distinctId = truncateString(id, FIELD_LENGTH.distinctId);

    let { sessionId, visitId, iat, sessionDrift } = resolveCollectionSession({
      sourceId,
      ip,
      userAgent,
      distinctId,
      createdAt,
      cache,
      historical: timestamp !== undefined,
    });

    // Reuse the anonymous session when the same visitor identifies, but only if:
    //  - the client fingerprint (IP/UA) has not genuinely changed
    //  - the session is not already claimed by a different identity
    // sessionDrift is true whenever cache.sessionId !== computed sessionId.
    // That includes the normal identify transition (distinctId changes the hash).
    // To tell apart "same client, new identity" from "different client", we
    // recompute the session ID without distinctId and compare to the cached one.
    if (distinctId && cache?.sessionId && sessionDrift) {
      // Resolved without distinctId, so its visit state has not been reset by
      // the identity drift: it keeps the cached visit and applies the normal
      // 30-minute expiry.
      const fingerprint = resolveCollectionSession({
        sourceId,
        ip,
        userAgent,
        createdAt,
        cache,
        historical: timestamp !== undefined,
      });
      // If the fingerprint-only ID still doesn't match the cache, the client
      // itself changed (IP or UA rotation) — do not reuse.
      const clientChanged = fingerprint.sessionId !== cache.sessionId;

      if (!clientChanged) {
        let canReuse = false;

        if (cache.sessionLinkId === hash(cache.sessionId, distinctId)) {
          // Fast path: the cache token already proves this user owns the session
          canReuse = true;
        } else {
          // Slow path: atomically check-and-claim the session in the DB so
          // concurrent identities cannot both claim the same anonymous session.
          try {
            canReuse = await tryClaimAnonymousSession({
              websiteId,
              sessionId: cache.sessionId,
              distinctId,
              createdAt,
            });
          } catch {
            // Best-effort: if the lookup fails, fall through to the new session
            // so collection is never blocked by an identity-link read failure.
          }
        }

        if (canReuse) {
          ({ sessionId, visitId, iat, sessionDrift } = fingerprint);
        }
      }
    }
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
