import { isbot } from 'isbot';
import { serializeError } from 'serialize-error';
import { z } from 'zod';
import { secret } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { parseToken } from '@/lib/jwt';
import { fetchAccount } from '@/lib/load';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json, serverError } from '@/lib/response';
import { getWebsite } from '@/queries/prisma';
import { saveRecording } from '@/queries/sql';

interface Cache {
  sessionId: string;
  visitId: string;
}

const schema = z.object({
  website: z.uuid(),
  events: z.array(z.any()).max(200),
  timestamp: z.coerce.number().int().optional(),
});

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, schema, { skipAuth: true });

    if (error) {
      return error();
    }

    const { website: websiteId, events, timestamp } = body;

    if (!events?.length) {
      return json({ ok: true });
    }

    // Parse cache token to get session info
    const cacheHeader = request.headers.get('x-umami-cache');

    if (!cacheHeader) {
      return badRequest({ message: 'Missing session token.' });
    }

    const cache = (await parseToken(cacheHeader, secret())) as Cache | null;

    if (!cache?.sessionId || !cache?.visitId) {
      return badRequest({ message: 'Invalid session token.' });
    }

    const { sessionId, visitId } = cache;

    // Query directly to avoid stale Redis cache for recordingEnabled
    const website = await getWebsite(websiteId);

    if (!website) {
      return badRequest({ message: 'Website not found.' });
    }

    if (!website.replayEnabled) {
      return json({ ok: false, reason: 'replay_disabled' });
    }

    if (process.env.CLOUD_MODE) {
      const account = await fetchAccount(website.userId);

      if (!account?.isBusiness) {
        return forbidden({ message: 'Business subscription required.' });
      }
    }

    // Client info for bot/IP checks
    const { ip, userAgent } = await getClientInfo(request, {});

    if (!process.env.DISABLE_BOT_CHECK && isbot(userAgent)) {
      return json({ beep: 'boop' });
    }

    if (hasBlockedIp(ip)) {
      return forbidden();
    }

    // Compute timestamps from events
    const eventTimestamps = events
      .map((e: any) => Number(e?.timestamp))
      .filter((t: number) => Number.isFinite(t) && t > 0);

    const fallbackMs = (timestamp || Math.floor(Date.now() / 1000)) * 1000;
    const minTimestamp = eventTimestamps.length ? Math.min(...eventTimestamps) : fallbackMs;
    const maxTimestamp = eventTimestamps.length ? Math.max(...eventTimestamps) : fallbackMs;

    const startedAt = new Date(minTimestamp);
    const endedAt = new Date(maxTimestamp);

    // Use timestamp-based chunk index for ordering
    const chunkIndex = timestamp || Math.floor(Date.now() / 1000);

    await saveRecording({
      websiteId,
      sessionId,
      visitId,
      chunkIndex,
      events,
      eventCount: events.length,
      startedAt,
      endedAt,
    });

    return json({ ok: true });
  } catch (e) {
    const error = serializeError(e);

    // eslint-disable-next-line no-console
    console.log(error);

    return serverError({ errorObject: error });
  }
}
