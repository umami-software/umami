import { prisma, runQuery } from 'lib/db/relational';

export async function getAccountByUsername(username) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        username,
      },
    }),
  );
}
