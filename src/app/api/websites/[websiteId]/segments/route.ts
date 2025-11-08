import { canUpdateWebsite, canViewWebsite } from '@/permissions';
import { uuid } from '@/lib/crypto';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { segmentTypeParam, searchParams, anyObjectParam } from '@/lib/schema';
import { createSegment, getWebsiteSegments } from '@/queries/prisma';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type } = query;

  if (websiteId && !(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const filters = await getQueryFilters(query);

  const segments = await getWebsiteSegments(websiteId, type, filters);

  return json(segments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    name: z.string().max(200),
    parameters: anyObjectParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId } = await params;
  const { type, name, parameters } = body;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const result = await createSegment({
    id: uuid(),
    websiteId,
    type,
    name,
    parameters,
  } as any);

  return json(result);
}
