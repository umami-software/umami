import { after } from 'next/server';
import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { backfillOgMetadata, createLink, getUserLinks } from '@/queries/prisma';
import {
  isHttpUrl,
  ogDescriptionField,
  ogImageField,
  ogTitleField,
  utmField,
} from './schemas';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
    ...sortingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const filters = await getQueryFilters(query);

  const links = await getUserLinks(auth.user.id, filters);

  return json(links);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    url: z
      .string()
      .max(500)
      .refine(isHttpUrl, { message: 'url must be an http(s) URL' }),
    slug: z.string().max(100),
    teamId: z.string().nullable().optional(),
    id: z.uuid().nullable().optional(),
    utmSource: utmField,
    utmMedium: utmField,
    utmCampaign: utmField,
    utmTerm: utmField,
    utmContent: utmField,
    ogTitle: ogTitleField,
    ogDescription: ogDescriptionField,
    ogImage: ogImageField,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const {
    id,
    name,
    url,
    slug,
    teamId,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    ogTitle,
    ogDescription,
    ogImage,
  } = body;

  if ((teamId && !(await canCreateTeamWebsite(auth, teamId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    name,
    url,
    slug,
    teamId,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    ogTitle,
    ogDescription,
    ogImage,
  };

  if (!teamId) {
    data.userId = auth.user.id;
  }

  const result = await createLink(data);

  after(() => backfillOgMetadata(result.id, data, null));

  return json(result);
}
