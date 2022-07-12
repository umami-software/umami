import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getAccountById(user_id) {
  return runQuery(
    prisma.account.findUnique({
      where: {
        user_id,
      },
    }),
  );
}
