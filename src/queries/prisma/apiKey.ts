import prisma from '@/lib/prisma';

export async function createApiKey(data: {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
}) {
  return prisma.client.apiKey.create({
    data,
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });
}

export async function getApiKeyByHash(keyHash: string) {
  return prisma.client.apiKey.findUnique({
    where: { keyHash },
  });
}

export async function getUserApiKeys(userId: string) {
  return prisma.client.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteApiKey(id: string, userId: string) {
  const { count } = await prisma.client.apiKey.deleteMany({
    where: { id, userId },
  });

  return count;
}

export async function updateApiKeyLastUsed(id: string) {
  return prisma.client.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}
