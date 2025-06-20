import { canUpdateWebsite, canViewWebsite } from '@/lib/auth';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { segmentTypeParam } from '@/lib/schema';
import { createSegment, getWebsiteSegments } from '@/queries';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
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

  const segments = await getWebsiteSegments(websiteId, type);

  return json(segments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const schema = z.object({
    type: segmentTypeParam,
    name: z.string().max(200),
    parameters: z.object({}).passthrough(),
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
