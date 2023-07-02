import { Prisma } from '@prisma/client';
import cache from 'lib/cache';
import prisma from 'lib/prisma';

export async function createSession(data: Prisma.SessionCreateInput) {
  const {
    id,
    websiteId,
    hostname,
    browser,
    os,
    device,
    screen,
    language,
    country,
    subdivision1,
    subdivision2,
    city,
  } = data;

  return prisma.client.session
    .create({
      data: {
        id,
        websiteId,
        hostname,
        browser,
        os,
        device,
        screen,
        language,
        country,
        subdivision1: country && subdivision1 ? `${country}-${subdivision1}` : null,
        subdivision2,
        city,
      },
    })
    .then(async data => {
      if (cache.enabled) {
        await cache.storeSession(data);
      }

      return data;
    });
}
