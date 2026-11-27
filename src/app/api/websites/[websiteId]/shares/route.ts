import { z } from 'zod';
import { ENTITY_TYPE } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { filterParams, pagingParams, shareParametersSchema } from '@/lib/schema';
import { canUpdateWebsite, canViewAuthenticatedWebsite } from '@/permissions';
import { createShare, getSharesByEntityId, getWebsiteSegment } from '@/queries/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    ...filterParams,
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { page, pageSize, search } = query;

  if (!(await canViewAuthenticatedWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getSharesByEntityId(websiteId, {
    page,
    pageSize,
    search,
  });

  return json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    name: z.string().max(200),
    parameters: shareParametersSchema.optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { name, parameters } = body;
  const shareParameters = parameters ?? {};

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (shareParameters.segment) {
    const segment = await getWebsiteSegment(websiteId, shareParameters.segment);

    if (!segment) {
      return badRequest({ message: 'Invalid segment.' });
    }
  }

  const slug = getRandomChars(16);

  const share = await createShare({
    id: uuid(),
    entityId: websiteId,
    shareType: ENTITY_TYPE.website,
    name,
    slug,
    parameters: shareParameters,
  });

  return json(share);
}
