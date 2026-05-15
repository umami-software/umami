import type { Prisma } from '@/generated/prisma/client';
import {
  CITY_LENGTH,
  COUNTRY_LENGTH,
  DISTINCT_ID_LENGTH,
  LANGUAGE_LENGTH,
  SCREEN_LENGTH,
  SESSION_FIELD_LENGTH,
} from '@/lib/constants';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'createSession';

export async function createSession(data: Prisma.SessionCreateInput) {
  const { rawQuery } = prisma;

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
    {
      ...data,
      browser: data.browser?.substring(0, SESSION_FIELD_LENGTH),
      os: data.os?.substring(0, SESSION_FIELD_LENGTH),
      device: data.device?.substring(0, SESSION_FIELD_LENGTH),
      screen: data.screen?.substring(0, SCREEN_LENGTH),
      language: data.language?.substring(0, LANGUAGE_LENGTH),
      country: data.country?.substring(0, COUNTRY_LENGTH),
      region: data.region?.substring(0, SESSION_FIELD_LENGTH),
      city: data.city?.substring(0, CITY_LENGTH),
      distinctId: data.distinctId?.substring(0, DISTINCT_ID_LENGTH),
    },
    FUNCTION_NAME,
  );
}
