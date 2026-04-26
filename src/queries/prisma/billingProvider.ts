import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

const db = () => (prisma.client as any).billingProvider;

function maskKey(apiKey: string): string {
  // Show last 4 chars: sk_live_****abcd
  return apiKey.length > 4 ? `****${apiKey.slice(-4)}` : '****';
}

export async function getBillingProviderByUser(userId: string, provider: string) {
  return db().findUnique({
    where: { provider_userId: { provider, userId } },
  });
}

export async function getBillingProviderByTeam(teamId: string, provider: string) {
  return db().findUnique({
    where: { provider_teamId: { provider, teamId } },
  });
}

export async function upsertBillingProviderForUser(
  userId: string,
  provider: string,
  encryptedKey: string,
) {
  return db().upsert({
    where: { provider_userId: { provider, userId } },
    create: { id: uuid(), provider, userId, apiKey: encryptedKey },
    update: { apiKey: encryptedKey },
  });
}

export async function upsertBillingProviderForTeam(
  teamId: string,
  provider: string,
  encryptedKey: string,
) {
  return db().upsert({
    where: { provider_teamId: { provider, teamId } },
    create: { id: uuid(), provider, teamId, apiKey: encryptedKey },
    update: { apiKey: encryptedKey },
  });
}

export async function deleteBillingProviderByUser(userId: string, provider: string) {
  return db().delete({
    where: { provider_userId: { provider, userId } },
  });
}

export async function deleteBillingProviderByTeam(teamId: string, provider: string) {
  return db().delete({
    where: { provider_teamId: { provider, teamId } },
  });
}

export async function getBillingProviderById(id: string) {
  return db().findUnique({ where: { id } });
}

export async function updateBillingProviderSync(
  id: string,
  data: { syncStatus: string; syncCursor?: string | null },
) {
  return db().update({ where: { id }, data });
}

export async function getBillingProviderSyncStatuses() {
  return db().findMany({
    select: {
      id: true,
      provider: true,
      userId: true,
      teamId: true,
      syncStatus: true,
      syncCursor: true,
      updatedAt: true,
    },
  });
}

export { maskKey };
