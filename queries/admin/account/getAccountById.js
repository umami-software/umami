import { prisma, runQuery } from 'lib/db/relational';

export async function getAccountById(user_id) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        user_id,
      },
    }),
  );
}
