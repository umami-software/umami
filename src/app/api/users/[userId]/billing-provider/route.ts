import { z } from 'zod';
import { decrypt, encrypt, secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { canManageBillingProviderForUser } from '@/permissions';
import {
  deleteBillingProviderByUser,
  getBillingProviderByUser,
  maskKey,
  upsertBillingProviderForUser,
} from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const schema = z.object({ provider: z.string().max(50) });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canManageBillingProviderForUser(auth, userId))) {
    return unauthorized();
  }

  const { provider } = query;
  const row = await getBillingProviderByUser(userId, provider);

  if (!row) {
    return notFound();
  }

  const rawKey = decrypt(row.apiKey, secret());

  return json({ provider: row.provider, keyPreview: maskKey(rawKey), updatedAt: row.updatedAt });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const schema = z.object({
    provider: z.string().max(50),
    apiKey: z.string().min(1),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canManageBillingProviderForUser(auth, userId))) {
    return unauthorized();
  }

  const { provider, apiKey } = body;
  const encryptedKey = encrypt(apiKey, secret());
  const row = await upsertBillingProviderForUser(userId, provider, encryptedKey);
  const rawKey = decrypt(row.apiKey, secret());

  return json({ provider: row.provider, keyPreview: maskKey(rawKey), updatedAt: row.updatedAt });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const schema = z.object({ provider: z.string().max(50) });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { userId } = await params;

  if (!(await canManageBillingProviderForUser(auth, userId))) {
    return unauthorized();
  }

  const { provider } = query;
  const row = await getBillingProviderByUser(userId, provider);

  if (!row) {
    return notFound();
  }

  await deleteBillingProviderByUser(userId, provider);

  return ok();
}
