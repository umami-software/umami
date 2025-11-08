import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function createSession(data: Prisma.SessionCreateInput) {
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
    if (e.message.toLowerCase().includes('unique constraint')) {
      return null;
    }
    throw e;
  }
}
