import { gzipSync } from 'node:zlib';
import { isbot } from 'isbot';
import { serializeError } from 'serialize-error';
import { z } from 'zod';
import { secret } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { parseToken } from '@/lib/jwt';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json, serverError } from '@/lib/response';
import { getWebsite } from '@/queries/prisma';
import { saveRecordingChunk } from '@/queries/sql';

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

    const cache = await parseToken(cacheHeader, secret());

    if (!cache || !cache.sessionId) {
      return badRequest({ message: 'Invalid session token.' });
    }

    const { sessionId } = cache;

    // Query directly to avoid stale Redis cache for recordingEnabled
    const website = await getWebsite(websiteId);

    if (!website) {
      return badRequest({ message: 'Website not found.' });
    }

    if (!website.recordingEnabled) {
      return json({ ok: false, reason: 'recording_disabled' });
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
      .map((e: any) => e.timestamp)
      .filter((t: any) => typeof t === 'number');

    const startedAt = new Date(Math.min(...eventTimestamps));
    const endedAt = new Date(Math.max(...eventTimestamps));

    // Compress events
    const eventsJson = JSON.stringify(events);
    const compressed = gzipSync(Buffer.from(eventsJson, 'utf-8'));

    // Use timestamp-based chunk index for ordering
    const chunkIndex = timestamp || Math.floor(Date.now() / 1000);

    await saveRecordingChunk({
      websiteId,
      sessionId,
      chunkIndex,
      events: compressed,
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
