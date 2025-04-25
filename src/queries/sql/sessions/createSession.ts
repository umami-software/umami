import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function createSession(data: Prisma.SessionCreateInput) {
  const { id, websiteId, browser, os, device, screen, language, country, region, city } = data;

  return prisma.client.session.create({
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
    },
  });
}
