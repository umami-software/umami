import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

const db = () => (prisma.client as any).billing;

function maskKey(apiKey: string): string {
  // Show last 4 chars: sk_live_****abcd
  return apiKey.length > 4 ? `****${apiKey.slice(-4)}` : '****';
}

export async function getBillingByUser(userId: string, provider: string) {
  return db().findUnique({
    where: { provider_userId: { provider, userId } },
  });
}

export async function getBillingByTeam(teamId: string, provider: string) {
  return db().findUnique({
    where: { provider_teamId: { provider, teamId } },
  });
}

export async function upsertBillingForUser(
  userId: string,
  provider: string,
  name: string,
  encryptedKey: string,
) {
  return db().upsert({
    where: { provider_userId: { provider, userId } },
    create: { id: uuid(), name, provider, userId, apiKey: encryptedKey, updatedAt: new Date() },
    update: { name, apiKey: encryptedKey, updatedAt: new Date() },
  });
}

export async function upsertBillingForTeam(
  teamId: string,
  provider: string,
  name: string,
  encryptedKey: string,
) {
  return db().upsert({
    where: { provider_teamId: { provider, teamId } },
    create: { id: uuid(), name, provider, teamId, apiKey: encryptedKey, updatedAt: new Date() },
    update: { name, apiKey: encryptedKey, updatedAt: new Date() },
  });
}

export async function deleteBillingByUser(userId: string, provider: string) {
  return db().delete({
    where: { provider_userId: { provider, userId } },
  });
}

export async function deleteBillingByTeam(teamId: string, provider: string) {
  return db().delete({
    where: { provider_teamId: { provider, teamId } },
  });
}

export async function getBillingById(id: string) {
  return db().findUnique({ where: { id } });
}

export async function updateBillingSync(
  id: string,
  data: { syncStatus: string; syncCursor?: string | null; lastRunAt?: Date | null },
) {
  return db().update({ where: { id }, data });
}

export async function getBillingSyncStatuses() {
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

const providerSelect = {
  id: true,
  name: true,
  provider: true,
  userId: true,
  teamId: true,
  syncStatus: true,
  syncCursor: true,
  lastRunAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function getBillingsPage(
  where: Record<string, any> = {},
  filters?: Record<string, any>,
) {
  return prisma.pagedQuery(
    'billing',
    { where, select: providerSelect },
    { orderBy: 'createdAt', sortDescending: true, ...filters },
  );
}

export async function updateBilling(
  id: string,
  data: { name?: string; apiKey?: string; provider?: string },
) {
  return db().update({ where: { id }, data: { ...data, updatedAt: new Date() } });
}

export async function deleteBillingById(id: string) {
  return db().delete({ where: { id } });
}

export { maskKey };
