import Stripe from 'stripe';
import { z } from 'zod';
import { decrypt, encrypt, secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import {
  getBillingsPage,
  maskKey,
  updateBillingWebhook,
  upsertBillingForTeam,
  upsertBillingForUser,
} from '@/queries/prisma';

export async function GET(request: Request) {
  const schema = z.object({
    userId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { userId, teamId, ...filters } = query;

  let where: Record<string, any> = {};

  if (teamId) {
    if (!auth.user.isAdmin) {
      return unauthorized();
    }
    where = { teamId };
  } else {
    const ownerId = userId ?? auth.user.id;
    if (!auth.user.isAdmin && ownerId !== auth.user.id) {
      return unauthorized();
    }
    where = auth.user.isAdmin && !userId ? {} : { userId: ownerId };
  }

  const result = await getBillingsPage(where, filters);

  return json(result);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    provider: z.string().max(50),
    apiKey: z.string().min(1),
    userId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    webhookId: z.string().max(255).optional(),
    webhookSecret: z.string().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { name, provider, apiKey, userId, teamId, webhookId, webhookSecret } = body;

  if (!userId && !teamId) {
    return new Response(JSON.stringify({ error: 'userId or teamId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!auth.user.isAdmin) {
    if (userId && userId !== auth.user.id) {
      return unauthorized();
    }
    if (teamId) {
      return unauthorized();
    }
  }

  const encryptedKey = encrypt(apiKey, secret());
  const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret, secret()) : null;

  const row = userId
    ? await upsertBillingForUser(
        userId,
        provider,
        name,
        encryptedKey,
        webhookId ?? null,
        encryptedWebhookSecret,
      )
    : await upsertBillingForTeam(
        teamId,
        provider,
        name,
        encryptedKey,
        webhookId ?? null,
        encryptedWebhookSecret,
      );

  const rawKey = decrypt(row.apiKey, secret());

  if (!webhookId && !webhookSecret && process.env.APP_URL) {
    const stripe = new Stripe(rawKey, { apiVersion: '2026-02-25.clover' });
    const webhook = await stripe.webhookEndpoints.create({
      url: `${process.env.APP_URL}/api/billing/${row.id}/webhook`,
      enabled_events: [
        'invoice.created',
        'invoice.finalized',
        'invoice.paid',
        'invoice.payment_failed',
        'invoice.updated',
        'invoice.voided',
        'invoice.marked_uncollectible',
      ],
    });
    await updateBillingWebhook(row.id, {
      webhookId: webhook.id,
      webhookSecret: encrypt(webhook.secret, secret()),
    });
  }

  return json({
    id: row.id,
    provider: row.provider,
    userId: row.userId,
    teamId: row.teamId,
    keyPreview: maskKey(rawKey),
    syncStatus: row.syncStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
