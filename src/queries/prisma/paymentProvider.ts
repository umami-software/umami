import { uuid } from '@/lib/crypto';
import prisma from '@/lib/prisma';

const db = () => (prisma.client as any).paymentProvider;

function maskKey(apiKey: string): string {
  // Show last 4 chars: sk_live_****abcd
  return apiKey.length > 4 ? `****${apiKey.slice(-4)}` : '****';
}

export async function getPaymentProviderByUser(userId: string) {
  return db().findUnique({
    where: { userId: userId },
  });
}

export async function getPaymentProviderByTeam(teamId: string) {
  return db().findUnique({
    where: { teamId: teamId },
  });
}

export async function upsertPaymentProviderForUser(
  userId: string,
  provider: string,
  name: string,
  encryptedKey: string,
  webhookId: string | null,
  webhookSecret: string | null,
) {
  return db().upsert({
    where: { name_userId: { name, userId } },
    create: {
      id: uuid(),
      name,
      provider,
      userId,
      apiKey: encryptedKey,
      webhookId,
      webhookSecret,
      updatedAt: new Date(),
    },
    update: { provider, apiKey: encryptedKey, webhookId, webhookSecret, updatedAt: new Date() },
  });
}

export async function upsertPaymentProviderForTeam(
  teamId: string,
  provider: string,
  name: string,
  encryptedKey: string,
  webhookId: string | null,
  webhookSecret: string | null,
) {
  return db().upsert({
    where: { name_teamId: { name, teamId } },
    create: {
      id: uuid(),
      name,
      provider,
      teamId,
      apiKey: encryptedKey,
      webhookId,
      webhookSecret,
      updatedAt: new Date(),
    },
    update: { provider, apiKey: encryptedKey, webhookId, webhookSecret, updatedAt: new Date() },
  });
}

export async function getPaymentProviderById(id: string) {
  return db().findUnique({ where: { id } });
}

export async function updatePaymentProviderWebhook(
  id: string,
  data: { webhookId: string; webhookSecret: string },
) {
  return db().update({ where: { id }, data });
}

export async function updatePaymentProviderSync(
  id: string,
  data: { syncStatus: string; syncCursor?: string | null; lastRunAt?: Date | null },
) {
  return db().update({ where: { id }, data });
}

export async function getPaymentProviderSyncStatuses() {
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

export async function getPaymentProvidersPage(
  where: Record<string, any> = {},
  filters?: Record<string, any>,
) {
  return prisma.pagedQuery(
    'paymentProvider',
    { where, select: providerSelect },
    { orderBy: 'createdAt', sortDescending: true, ...filters },
  );
}

export async function updatePaymentProvider(
  id: string,
  data: {
    name?: string;
    apiKey?: string;
    provider?: string;
    webhookId?: string;
    webhookSecret?: string;
  },
) {
  return db().update({ where: { id }, data: { ...data, updatedAt: new Date() } });
}

export async function deletePaymentProviderById(id: string) {
  return db().delete({ where: { id } });
}

export { maskKey };
