import prisma from 'lib/prisma';

export async function createAccount(data) {
  return prisma.client.account.create({
    data,
  });
}
