import { isbot } from 'isbot';
import clickhouse from '@/lib/clickhouse';
import { type CollectionCache, resolveCollectionSession } from '@/lib/collection-session';
import { CACHE_TOKEN_TYPE } from '@/lib/constants';
import { withCorsHeaders } from '@/lib/cors';
import { secret } from '@/lib/crypto';
import { getClientInfo, hasBlockedIp } from '@/lib/detect';
import { isErrorTrackingEnabled } from '@/lib/errors/config';
import { type ErrorIngestionOutcome, recordErrorIngestion } from '@/lib/errors/metrics';
import type { ErrorPayload } from '@/lib/errors/schema';
import { createToken, parseToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { badRequest, forbidden, json, payloadTooLarge, serverError } from '@/lib/response';
import { consumeErrorQuota, saveError } from '@/queries/sql/errors/store';
import { createSession } from '@/queries/sql/sessions/createSession';

const MAX_BYTES = 48000;

export async function collectError(request: Request, payload: ErrorPayload) {
  const respond = (response: Response, outcome?: ErrorIngestionOutcome) => {
    const outcomes: Record<number, ErrorIngestionOutcome> = {
      200: 'accepted',
      400: 'invalid',
      403: 'blocked',
      413: 'oversized',
      429: 'throttled',
    };
    recordErrorIngestion(outcome || outcomes[response.status] || 'failed');
    return withCorsHeaders(response, { 'Access-Control-Expose-Headers': 'Retry-After' });
  };
  try {
    // Bound the actual stream, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return respond(badRequest());
    let bytes = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return respond(payloadTooLarge({ maxBytes: MAX_BYTES }));
      }
    }
    const website = await prisma.client.website.findUnique({ where: { id: payload.website } });
    if (!website || website.deletedAt)
      return respond(badRequest({ message: 'Website not found.' }));
    if (!isErrorTrackingEnabled(website))
      return respond(json({ ok: false, reason: 'errors_disabled' }), 'disabled');
    const now = Date.now();
    if (
      payload.timestamp > now + 300000 ||
      payload.timestamp < now - website.errorRetentionDays * 86400000 ||
      (website.resetAt && payload.timestamp <= +website.resetAt)
    ) {
      return respond(badRequest({ message: 'Error timestamp is outside the retention window.' }));
    }
    let cache: CollectionCache | null = null;
    const header = request.headers.get('x-umami-cache');
    if (header) {
      const token = await parseToken(header, secret());
      if (
        token?.type !== CACHE_TOKEN_TYPE ||
        token.websiteId !== payload.website ||
        !token.sessionId ||
        !token.visitId
      ) {
        return respond(badRequest({ message: 'Invalid session token.' }));
      }
      cache = token;
    }
    // Never accept caller-supplied IP or user-agent overrides on this public route.
    const info = await getClientInfo(request, {});
    if (!process.env.DISABLE_BOT_CHECK && isbot(info.userAgent))
      return respond(json({ ok: false, reason: 'bot' }), 'blocked');
    if (hasBlockedIp(info.ip)) return respond(forbidden());
    if (!(await consumeErrorQuota(payload.website))) {
      return respond(
        Response.json(
          { error: { message: 'Error quota exceeded.', code: 'rate-limited', status: 429 } },
          { status: 429, headers: { 'Retry-After': '60' } },
        ),
      );
    }
    const session = resolveCollectionSession({
      sourceId: payload.website,
      ip: info.ip,
      userAgent: info.userAgent,
      distinctId: payload.id,
      createdAt: new Date(payload.timestamp),
      cache,
    });
    if (!clickhouse.enabled) {
      await createSession({
        id: session.sessionId,
        websiteId: payload.website,
        browser: info.browser,
        os: info.os,
        device: info.device,
        screen: payload.screen,
        language: payload.language,
        createdAt: new Date(payload.timestamp),
      });
    }
    const saved = await saveError(payload, { ...session, ...info });
    const token = createToken(
      {
        websiteId: payload.website,
        sessionId: session.sessionId,
        visitId: session.visitId,
        iat: session.iat,
        type: CACHE_TOKEN_TYPE,
      },
      secret(),
    );
    return respond(json({ ok: true, ...saved, cache: token }));
  } catch {
    // Error payloads and database exception parameters may contain sensitive data.
    return respond(serverError('Error collection failed.'));
  }
}
