import { isbot } from 'isbot';
import { serializeError } from 'serialize-error';
import { z } from 'zod';
import { HEATMAP_EVENT_TYPE } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { parseToken } from '@/lib/jwt';
import { fetchAccount, fetchTeam } from '@/lib/load';
import { getRecorderConfig } from '@/lib/recorder';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json, serverError } from '@/lib/response';
import { getWebsite } from '@/queries/prisma';
import { saveRecording } from '@/queries/sql';
import { saveHeatmapEvents } from '@/queries/sql/heatmap/saveHeatmapEvents';

interface Cache {
  sessionId: string;
  visitId: string;
}

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('record'),
    payload: z.object({
      website: z.uuid(),
      events: z.array(z.any()).max(200),
      timestamp: z.coerce.number().int().optional(),
    }),
  }),
  z.object({
    type: z.literal('heatmap'),
    payload: z.object({
      website: z.uuid(),
      events: z
        .array(
          z.discriminatedUnion('type', [
            z.object({
              type: z.literal('click'),
              url: z.string(),
              x: z.coerce.number().optional(),
              y: z.coerce.number().optional(),
              pageX: z.coerce.number().optional(),
              pageY: z.coerce.number().optional(),
              pageW: z.coerce.number().optional(),
              pageH: z.coerce.number().optional(),
              viewportW: z.coerce.number().optional(),
              viewportH: z.coerce.number().optional(),
              timestamp: z.coerce.number().int().optional(),
            }),
            z.object({
              type: z.literal('scroll'),
              url: z.string(),
              scrollPct: z.coerce.number().optional(),
              pageW: z.coerce.number().optional(),
              pageH: z.coerce.number().optional(),
              viewportW: z.coerce.number().optional(),
              viewportH: z.coerce.number().optional(),
              timestamp: z.coerce.number().int().optional(),
            }),
          ]),
        )
        .max(200),
      timestamp: z.coerce.number().int().optional(),
    }),
  }),
]);

function getUrlPath(url: string) {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url.startsWith('/') ? url.split(/[?#]/)[0] || '/' : '/';
  }
}

export async function POST(request: Request) {
  try {
    const { body, error } = await parseRequest(request, schema, { skipAuth: true });

    if (error) {
      return error();
    }

    const { website: websiteId } = body.payload;
    const events = body.payload.events;
    const timestamp = body.payload.timestamp;

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

    // Query directly to avoid stale Redis cache for recorderEnabled
    const website = await getWebsite(websiteId);

    if (!website) {
      return badRequest({ message: 'Website not found.' });
    }

    const recorderConfig = getRecorderConfig(website.replayConfig);
    const replayEnabled = recorderConfig.replayEnabled === true;
    const heatmapEnabled = recorderConfig.heatmapEnabled === true;

    if (!website.recorderEnabled) {
      return json({ ok: false, reason: 'recorder_disabled' });
    }

    if (process.env.CLOUD_MODE) {
      const account = website.teamId
        ? await fetchTeam(website.teamId)
        : website.userId
          ? await fetchAccount(website.userId)
          : null;

      if (!account?.isBusiness && !account?.isNoBilling) {
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

    if (body.type === 'record') {
      if (!replayEnabled) {
        return json({ ok: false, reason: 'replay_disabled' });
      }

      const eventTimestamps = events
        .map((e: any) => Number(e?.timestamp))
        .filter((t: number) => Number.isFinite(t) && t > 0);

      const fallbackMs = (timestamp || Math.floor(Date.now() / 1000)) * 1000;
      const minTimestamp = eventTimestamps.length ? Math.min(...eventTimestamps) : fallbackMs;
      const maxTimestamp = eventTimestamps.length ? Math.max(...eventTimestamps) : fallbackMs;

      const startedAt = new Date(minTimestamp);
      const endedAt = new Date(maxTimestamp);
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
    }

    if (!heatmapEnabled) {
      return json({ ok: false, reason: 'heatmap_disabled' });
    }

    try {
      const fallbackMs = (timestamp || Math.floor(Date.now() / 1000)) * 1000;
      const heatmapRows = events.map(event => ({
        websiteId,
        sessionId,
        visitId,
        eventType: event.type === 'click' ? HEATMAP_EVENT_TYPE.click : HEATMAP_EVENT_TYPE.scroll,
        nodeId: null,
        x: event.type === 'click' ? (event.x ?? null) : null,
        y: event.type === 'click' ? (event.y ?? null) : null,
        pageX: event.type === 'click' ? (event.pageX ?? null) : null,
        pageY: event.type === 'click' ? (event.pageY ?? null) : null,
        pageW: event.pageW ?? null,
        viewportW: event.viewportW ?? null,
        viewportH: event.viewportH ?? null,
        pageH: event.pageH ?? null,
        scrollPct: event.type === 'scroll' ? (event.scrollPct ?? null) : null,
        urlPath: getUrlPath(event.url),
        createdAt: new Date(event.timestamp ?? fallbackMs),
        replayChunkIndex: null,
        replayEventIndex: null,
        replayTimeMs: null,
      }));

      if (heatmapRows.length) {
        await saveHeatmapEvents(heatmapRows);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('heatmap save failed', serializeError(e));
    }

    return json({ ok: true });
  } catch (e) {
    const error = serializeError(e);

    // eslint-disable-next-line no-console
    console.log(error);

    return serverError({ errorObject: error });
  }
}
