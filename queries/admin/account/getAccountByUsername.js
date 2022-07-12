import { runQuery } from 'queries';
import prisma from 'lib/db';

export async function getAccountByUsername(username) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        username,
      },
    }),
  );
}
