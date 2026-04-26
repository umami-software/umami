import { z } from 'zod';
import { decrypt, encrypt, secret } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, notFound, ok, unauthorized } from '@/lib/response';
import { canManageBillingProviderForTeam } from '@/permissions';
import {
  deleteBillingProviderByTeam,
  getBillingProviderByTeam,
  maskKey,
  upsertBillingProviderForTeam,
} from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const schema = z.object({ provider: z.string().max(50) });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canManageBillingProviderForTeam(auth, teamId))) {
    return unauthorized();
  }

  const { provider } = query;
  const row = await getBillingProviderByTeam(teamId, provider);

  if (!row) {
    return notFound();
  }

  const rawKey = decrypt(row.apiKey, secret());

  return json({ provider: row.provider, keyPreview: maskKey(rawKey), updatedAt: row.updatedAt });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const schema = z.object({
    provider: z.string().max(50),
    apiKey: z.string().min(1),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canManageBillingProviderForTeam(auth, teamId))) {
    return unauthorized();
  }

  const { provider, apiKey } = body;
  const encryptedKey = encrypt(apiKey, secret());
  const row = await upsertBillingProviderForTeam(teamId, provider, encryptedKey);
  const rawKey = decrypt(row.apiKey, secret());

  return json({ provider: row.provider, keyPreview: maskKey(rawKey), updatedAt: row.updatedAt });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const schema = z.object({ provider: z.string().max(50) });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canManageBillingProviderForTeam(auth, teamId))) {
    return unauthorized();
  }

  const { provider } = query;
  const row = await getBillingProviderByTeam(teamId, provider);

  if (!row) {
    return notFound();
  }

  await deleteBillingProviderByTeam(teamId, provider);

  return ok();
}
