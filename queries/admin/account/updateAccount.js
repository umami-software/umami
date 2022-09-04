import prisma from 'lib/prisma';

export async function updateAccount(user_id, data) {
  return prisma.client.account.update({
    where: {
      user_id,
    },
    data,
  });
}
