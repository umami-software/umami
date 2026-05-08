import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import { validateUrl } from '@/lib/og';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams, sortingParams } from '@/lib/schema';
import { canCreateTeamWebsite, canCreateWebsite } from '@/permissions';
import { createLink, getUserLinks } from '@/queries/prisma';

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

const utmField = z
  .string()
  .max(255)
  .transform(v => (v === '' ? null : v))
  .nullable()
  .optional();

const ogTextField = (max: number) =>
  z
    .string()
    .max(max)
    .transform(v => {
      const trimmed = v.trim();
      return trimmed === '' ? null : trimmed;
    })
    .nullable()
    .optional();

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.host;
  } catch {
    return false;
  }
}

// http(s) URL that doesn't resolve to a private/reserved IP literal.
function isPublicHttpUrl(value: string): boolean {
  return isHttpUrl(value) && validateUrl(value) !== null;
}

const ogImageField = z
  .string()
  .max(2047)
  .transform(v => {
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  })
  .nullable()
  .optional()
  .refine(v => v == null || isPublicHttpUrl(v), {
    message: 'ogImage must be a public http(s) URL',
  });

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
    ogTitle: ogTextField(255),
    ogDescription: ogTextField(500),
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

  return json(result);
}
