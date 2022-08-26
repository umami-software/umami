import { prisma, runQuery } from 'lib/relational';

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
    }),
  );
}
