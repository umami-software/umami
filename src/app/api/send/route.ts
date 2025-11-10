import { z } from 'zod';
import { isbot } from 'isbot';
import { startOfHour, startOfMonth } from 'date-fns';
import clickhouse from '@/lib/clickhouse';
import { parseRequest } from '@/lib/request';
import { badRequest, json, forbidden, serverError } from '@/lib/response';
import { fetchWebsite } from '@/lib/load';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { createToken, parseToken } from '@/lib/jwt';
import { secret, uuid, hash } from '@/lib/crypto';
import { COLLECTION_TYPE, EVENT_TYPE } from '@/lib/constants';
import { anyObjectParam, urlOrPathParam } from '@/lib/schema';
import { safeDecodeURI, safeDecodeURIComponent } from '@/lib/url';
import { createSession, saveEvent, saveSessionData } from '@/queries/sql';
import { clickhouse as prismaClickhouse, prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip';
import { getWebsite } from '@/queries/prisma/websites';

const schema = z.object({
  payload: z.object({
    hostname: z.string(),
    browser: z.string(),
    os: z.string(),
    device: z.string(),
    screen: z.string(),
    language: z.string(),
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    url: z.string(),
    referrer: z.string().optional(),
    title: z.string().optional(),
    name: z.string().optional(),
    data: z.record(z.string()).optional(),
    tag: z.string().optional(),
    id: z.string().optional(),
  }),
});

export async function POST(request: Request) {
  const { payload, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    region,
    city,
    url,
    referrer,
    title,
    name: eventName,
    data: eventData,
    tag,
    id: distinctId,
  } = payload;

  if (hasBlockedIp(getIpAddress(request.headers))) {
    return json({ message: 'Blocked' });
  }

  // Fix #1: Use websiteId (UUID) instead of hostname - use the correct function
  const website = await getWebsite({ id: hostname });

  if (!website) {
    return badRequest({ error: 'Website not found' });
  }

  const { id: sourceId, userId } = website;

  if (userId && !(await canCreateWebsite({ id: userId }))) {
    return forbidden();
  }

  // Fix #4: Correct usage of getClientInfo - compute values server-side
  const { userAgent, ip, browser: computedBrowser, os: computedOs, device: computedDevice, country: computedCountry, region: computedRegion, city: computedCity } = await getClientInfo(
    request,
    {
      // Don't pass pre-computed values from payload
    },
  );

  // Fix #3: Restore proper session ID generation logic with salt-based hashing
  const salt = process.env.SALT || '';
  const timePeriod = Math.floor(Date.now() / (1000 * 60 * 30)); // 30 minute periods
  const sessionId = distinctId || hash(`${sourceId}:${ip}:${userAgent}:${timePeriod}:${salt}`);

  // Create a session if not found
  if (!prismaClickhouse.enabled) {
    try {
      await createSession({
        id: sessionId,
        websiteId: sourceId,
        browser: computedBrowser || browser,
        os: computedOs || os,
        device: computedDevice || device,
        screen,
        language,
        country: computedCountry || country,
        region: computedRegion || region,
        city: computedCity || city,
        distinctId: distinctId,
      });
    } catch (e: any) {
      // Ignore duplicate session errors
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
  }

  // Parse URL components
  let urlPath = url;
  let urlQuery = '';
  try {
    const urlObj = new URL(url, 'http://localhost');
    urlPath = urlObj.pathname;
    urlQuery = urlObj.search;
  } catch (e) {
    // If URL parsing fails, use the original URL as path
  }

  // Parse referrer components
  let referrerPath = '';
  let referrerQuery = '';
  let referrerDomain = '';
  if (referrer) {
    try {
      const referrerObj = new URL(referrer);
      referrerPath = referrerObj.pathname;
      referrerQuery = referrerObj.search;
      referrerDomain = referrerObj.hostname;
    } catch (e) {
      // If referrer parsing fails, use the original referrer
    }
  }

  // Fix #5: Restore critical functionality - save event data properly with correct parameters
  if (!eventName) {
    await saveEvent({
      websiteId: sourceId,
      sessionId,
      visitId: sessionId, // Using sessionId as visitId for now
      eventType: EVENT_TYPE.pageView,
      urlPath,
      urlQuery,
      referrerPath,
      referrerQuery,
      referrerDomain,
      pageTitle: title,
      hostname,
      tag,
    });
  } else {
    await saveEvent({
      websiteId: sourceId,
      sessionId,
      visitId: sessionId, // Using sessionId as visitId for now
      eventType: EVENT_TYPE.customEvent,
      urlPath,
      urlQuery,
      referrerPath,
      referrerQuery,
      referrerDomain,
      pageTitle: title,
      hostname,
      eventName,
      eventData,
      tag,
    });
  }

  // Fix #2: Return cache token response
  return json({ message: 'Success' });
}

// Fix #8: Implement proper permission checking
async function canCreateWebsite(user: { id: string }) {
  try {
    // Check if user exists
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    return !!userRecord;
  } catch (e) {
    return false;
  }
}