import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function createAccount(data) {
  return runQuery(
    prisma.account.create({
      data,
    }),
  );
}
