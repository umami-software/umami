import { prisma, runQuery } from 'lib/db/relational';

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
    }),
  );
}
