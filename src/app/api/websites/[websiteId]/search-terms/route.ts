import { z } from 'zod';
import { getSearchTerms, getValidAccessToken } from '@/lib/google';
import { parseRequest } from '@/lib/request';
import { json, serverError, unauthorized } from '@/lib/response';
import { canViewWebsite } from '@/permissions';
import { getWebsiteGoogleAuthStatus } from '@/queries/prisma';
import { COUNTRY_ALPHA2_TO_ALPHA3, COUNTRY_CODES, GOOGLE_DOMAINS } from '@/lib/constants';

const schema = z.object({
  startAt: z.coerce.number(),
  endAt: z.coerce.number(),
  path: z.string().optional(),
  googleDomain: z.enum(GOOGLE_DOMAINS).optional(),
  country: z.enum(COUNTRY_CODES).optional(),
  limit: z.coerce.number().int().positive().max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const status = await getWebsiteGoogleAuthStatus(websiteId);

  if (!status) {
    return json({ rows: [], connected: false });
  }

  if (!status.propertyUrl) {
    return json({ rows: [], connected: true });
  }

  const { startAt, endAt, path, googleDomain, country, limit = 10, offset = 0 } = query;
  const countryAlpha3 = country ? COUNTRY_ALPHA2_TO_ALPHA3[country] : undefined;

  try {
    const accessToken = await getValidAccessToken(websiteId);
    const result = await getSearchTerms(accessToken, status.propertyUrl, {
      startAt,
      endAt,
      path,
      googleDomain,
      country: countryAlpha3,
      limit,
      offset,
    });
    return json({ ...result, connected: true });
  } catch (err: any) {
    return serverError({ message: err?.message ?? 'Failed to fetch search terms' });
  }
}
