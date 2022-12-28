import prisma from 'lib/prisma';

export async function getAccount(where) {
  return prisma.client.account.findUnique({
    where,
  });
}
