import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

const MAX_DELETE_RETRIES = 3;

type DeleteSecurityKeyResult = 'deleted' | 'not-found' | 'last-key';

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

export async function deleteSecurityKey(
  id: string,
  userId: string,
  { keepLastKey = false }: { keepLastKey?: boolean } = {},
): Promise<DeleteSecurityKeyResult> {
  for (let attempt = 1; ; attempt++) {
    try {
      // Serializable, so concurrent deletes can't both pass the last-key check.
      // prisma.transaction resolves to the batch overload, so cast to the callback's result.
      return await (prisma.transaction(
        async (tx: Prisma.TransactionClient): Promise<DeleteSecurityKeyResult> => {
          if (keepLastKey && (await tx.webAuthnCredential.count({ where: { userId } })) <= 1) {
            return 'last-key';
          }

          const { count } = await tx.webAuthnCredential.deleteMany({ where: { id, userId } });

          return count ? 'deleted' : 'not-found';
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ) as unknown as Promise<DeleteSecurityKeyResult>);
    } catch (err: any) {
      // The pg driver adapter reports serialization failures as SQLSTATE 40001
      const isWriteConflict = err.code === 'P2034' || err.cause?.originalCode === '40001';

      if (isWriteConflict && attempt < MAX_DELETE_RETRIES) {
        continue;
      }
      throw err;
    }
  }
}
