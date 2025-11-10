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
import { serializeError } from 'serialize-error';
import { TAG_COLORS } from '@/lib/constants';
import { clickhouse, prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip';
import { getWebsiteByUuid } from '@/queries/prisma/websites';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { createSession } from '@/queries/prisma/sessions';
import { createPageView, createEvent } from '@/queries/prisma/eventData';
import { getJsonBody, badRequest, json, methodNotAllowed, unauthorized } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import { z } from 'zod';

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

  const website = await getWebsiteByUuid(hostname);

  if (!website) {
    return badRequest('Website not found');
  }

  const { id: sourceId, userId } = website;

  if (userId && !(await canCreateWebsite({ id: userId }))) {
    return unauthorized();
  }

  const { userAgent, ip } = await getClientInfo(request, {
    userAgent: payload.browser,
    screen: payload.screen,
    language: payload.language,
    ip: getIpAddress(request.headers),
  });

  // Create a unique session ID based on the distinct ID or generate one
  const sessionId = distinctId || crypto.randomUUID();

  // Create a session if not found
  if (!clickhouse.enabled) {
    try {
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
        distinctId: distinctId,
      });
    } catch (e: any) {
      // Ignore duplicate session errors
      if (!e.message.toLowerCase().includes('unique constraint')) {
        throw e;
      }
    }
  }

  // Create page view or event
  if (!eventName) {
    await createPageView({
      id: crypto.randomUUID(),
      websiteId: sourceId,
      sessionId,
      url,
      referrer,
      title,
      tag,
    });
  } else {
    await createEvent({
      id: crypto.randomUUID(),
      websiteId: sourceId,
      sessionId,
      url,
      referrer,
      eventName,
      eventData,
    });
  }

  return json({ message: 'Success' });
}

async function canCreateWebsite(user: { id: string }) {
  // Implementation would depend on your permission system
  return true;
}
