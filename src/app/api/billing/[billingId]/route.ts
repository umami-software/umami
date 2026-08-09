import Stripe from 'stripe';
import { z } from 'zod';
import { decrypt, encrypt, secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { deleteBillingById, getBillingById, maskKey, updateBilling } from '@/queries/prisma';

function canAccess(
  user: { id: string; isAdmin: boolean },
  row: { userId: string | null; teamId: string | null },
) {
  return user.isAdmin || row.userId === user.id;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ billingId: string }> },
) {
  const { auth, error } = await parseRequest(request, z.object({}));

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { billingId } = await params;
  const row = await getBillingById(billingId);

  if (!row) {
    return notFound();
  }

  if (!canAccess(auth.user, row)) {
    return unauthorized();
  }

  const rawKey = decrypt(row.apiKey, secret());

  return json({
    id: row.id,
    provider: row.provider,
    userId: row.userId,
    teamId: row.teamId,
    keyPreview: maskKey(rawKey),
    webhookId: row.webhookId,
    webhookSecretPreview: row.webhookSecret ? maskKey(decrypt(row.webhookSecret, secret())) : null,
    syncStatus: row.syncStatus,
    syncCursor: row.syncCursor,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ billingId: string }> },
) {
  const schema = z.object({
    name: z.string().max(100).optional(),
    provider: z.string().max(50).optional(),
    apiKey: z.string().min(1).optional(),
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

  const { billingId } = await params;
  const existing = await getBillingById(billingId);

  if (!existing) {
    return notFound();
  }

  if (!canAccess(auth.user, existing)) {
    return unauthorized();
  }

  const update: Record<string, any> = {};
  if (body.name) update.name = body.name;
  if (body.provider) update.provider = body.provider;
  if (body.apiKey) update.apiKey = encrypt(body.apiKey, secret());
  if (body.webhookId) update.webhookId = body.webhookId;
  if (body.webhookSecret) update.webhookSecret = encrypt(body.webhookSecret, secret());
  const row = await updateBilling(billingId, update);
  const rawKey = decrypt(row.apiKey, secret());

  return json({
    id: row.id,
    provider: row.provider,
    userId: row.userId,
    teamId: row.teamId,
    keyPreview: maskKey(rawKey),
    syncStatus: row.syncStatus,
    updatedAt: row.updatedAt,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ billingId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { billingId } = await params;
  const row = await getBillingById(billingId);

  if (!row) {
    return notFound();
  }

  if (!canAccess(auth.user, row)) {
    return unauthorized();
  }

  await deleteBillingById(billingId);

  return ok();
}
