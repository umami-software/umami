import { prisma, runQuery } from 'lib/db';

export async function deleteAccount(user_id) {
  return runQuery(
    prisma.account.delete({
      where: {
        user_id,
      },
    }),
  );
}
