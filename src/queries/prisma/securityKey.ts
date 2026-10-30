import prisma from '@/lib/prisma';

export async function createSecurityKey(data: {
  userId: string;
  name: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
}) {
  return prisma.client.webAuthnCredential.create({
    data: { ...data, counter: BigInt(data.counter) },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function getUserSecurityKeys(userId: string) {
  return prisma.client.webAuthnCredential.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserSecurityKeyCredentials(userId: string) {
  return prisma.client.webAuthnCredential.findMany({
    where: { userId },
    select: {
      credentialId: true,
      transports: true,
    },
  });
}

export async function getSecurityKeyByCredentialId(credentialId: string) {
  return prisma.client.webAuthnCredential.findUnique({
    where: { credentialId },
  });
}

export async function getUserSecurityKeyCount(userId: string) {
  return prisma.client.webAuthnCredential.count({
    where: { userId },
  });
}

export async function updateSecurityKeyUsage(id: string, counter: number) {
  return prisma.client.webAuthnCredential.update({
    where: { id },
    data: { counter: BigInt(counter), lastUsedAt: new Date() },
  });
}

export async function deleteSecurityKey(id: string, userId: string) {
  const { count } = await prisma.client.webAuthnCredential.deleteMany({
    where: { id, userId },
  });

  return count;
}
