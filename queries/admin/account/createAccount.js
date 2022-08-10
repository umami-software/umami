import { prisma, runQuery } from 'lib/db';

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
    }),
  );
}
