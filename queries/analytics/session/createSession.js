import { runQuery } from 'queries';
import prisma from 'lib/db';

export async function createSession(website_id, data) {
  return runQuery(
    prisma.session.create({
      data: {
        website_id,
        ...data,
      },
      select: {
        session_id: true,
      },
    }),
  );
}
