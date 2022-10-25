import prisma from 'lib/prisma';

export async function updateAccount(data, where) {
  return prisma.client.account.update({
    where,
    data,
  });
}
