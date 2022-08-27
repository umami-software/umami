import { prisma, runQuery } from 'lib/relational';

export async function getAccountByUsername(username) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        username,
      },
    }),
  );
}
