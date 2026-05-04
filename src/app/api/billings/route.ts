import { z } from 'zod';
import { decrypt, encrypt, secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import {
  getBillingsPage,
  maskKey,
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
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!auth.user) {
    return unauthorized();
  }

  const { name, provider, apiKey, userId, teamId } = body;

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

  const row = userId
    ? await upsertBillingForUser(userId, provider, name, encryptedKey)
    : await upsertBillingForTeam(teamId, provider, name, encryptedKey);

  const rawKey = decrypt(row.apiKey, secret());

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
