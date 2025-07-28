import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function createSession(
  data: Prisma.SessionCreateInput,
  options = { skipDuplicates: false },
) {
  const {
    id,
    websiteId,
    browser,
    os,
    device,
    screen,
    language,
    country,
    region,
    city,
    distinctId,
  } = data;

  try {
    return await prisma.client.session.create({
      data: {
        id,
        websiteId,
        browser,
        os,
        device,
        screen,
        language,
        country,
        region,
        city,
        distinctId,
      },
    });
  } catch (e: any) {
    // With skipDuplicates flag: ignore unique constraint error and return null
    if (
      options.skipDuplicates &&
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return null;
    }
    throw e;
  }
}
