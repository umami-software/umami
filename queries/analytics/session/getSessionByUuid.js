import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getSessionByUuid(session_uuid) {
  return runQuery(
    prisma.session.findUnique({
      where: {
        session_uuid,
      },
    }),
  );
}
