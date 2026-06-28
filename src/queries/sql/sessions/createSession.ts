import type { Prisma } from '@/generated/prisma/client';
import { FIELD_LENGTH } from '@/lib/constants';
import { truncateString } from '@/lib/format';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'createSession';

export async function createSession(data: Prisma.SessionCreateInput) {
  const { rawQuery } = prisma;
  const normalizedData: Prisma.SessionCreateInput = {
    ...data,
    browser: truncateString(data.browser, FIELD_LENGTH.browser),
    os: truncateString(data.os, FIELD_LENGTH.os),
    device: truncateString(data.device, FIELD_LENGTH.device),
    screen: truncateString(data.screen, FIELD_LENGTH.screen),
    language: truncateString(data.language, FIELD_LENGTH.language),
    country: truncateString(data.country, FIELD_LENGTH.country),
    region: truncateString(data.region, FIELD_LENGTH.region),
    city: truncateString(data.city, FIELD_LENGTH.city),
    distinctId: truncateString(data.distinctId, FIELD_LENGTH.distinctId),
  };

  await rawQuery(
    `
    insert into session (
      session_id,
      website_id,
      browser,
      os,
      device,
      screen,
      language,
      country,
      region,
      city,
      distinct_id,
      created_at
    )
    values (
      {{id}},
      {{websiteId}},
      {{browser}},
      {{os}},
      {{device}},
      {{screen}},
      {{language}},
      {{country}},
      {{region}},
      {{city}},
      {{distinctId}},
      {{createdAt}}
    )
    on conflict (session_id) do nothing
    `,
    normalizedData,
    FUNCTION_NAME,
  );
}
