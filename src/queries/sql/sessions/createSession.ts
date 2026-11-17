import type { Prisma } from '@/generated/prisma/client';
import { FIELD_LENGTH } from '@/lib/constants';
import { truncateString } from '@/lib/format';
import prisma from '@/lib/prisma';

const FUNCTION_NAME = 'createSession';

export async function createSession(data: Prisma.SessionCreateInput) {
  const { writeRawQuery } = prisma;
  const normalizedData: Prisma.SessionCreateInput = {
    ...data,
    browser: truncateString(data.browser, FIELD_LENGTH.browser),
    browserVersion: truncateString(data.browserVersion, FIELD_LENGTH.browserVersion),
    os: truncateString(data.os, FIELD_LENGTH.os),
    osVersion: truncateString(data.osVersion, FIELD_LENGTH.osVersion),
    device: truncateString(data.device, FIELD_LENGTH.device),
    screen: truncateString(data.screen, FIELD_LENGTH.screen),
    language: truncateString(data.language, FIELD_LENGTH.language),
    country: truncateString(data.country, FIELD_LENGTH.country),
    region: truncateString(data.region, FIELD_LENGTH.region),
    city: truncateString(data.city, FIELD_LENGTH.city),
    distinctId: truncateString(data.distinctId, FIELD_LENGTH.distinctId),
  };

  await writeRawQuery(
    `
    insert into session (
      session_id,
      website_id,
      browser,
      browser_version,
      os,
      os_version,
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
      {{browserVersion}},
      {{os}},
      {{osVersion}},
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
